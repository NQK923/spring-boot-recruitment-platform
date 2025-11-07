package com.recruitment.platform.chat.recommendation.repository;

import com.fasterxml.jackson.databind.JsonNode;
import com.recruitment.platform.chat.recommendation.vector.PgVectorUtil;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.util.Assert;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.Optional;
import java.util.UUID;

@Repository
public class RecProfileRepository {

    private static final String UPSERT_SQL = """
        INSERT INTO rec_db.rec_profiles (user_id, company_id, summary, preferences, embedding, updated_at)
        VALUES (?, ?, ?, ?::jsonb, ?::vector, now())
        ON CONFLICT (user_id) DO UPDATE
        SET company_id = EXCLUDED.company_id,
            summary = EXCLUDED.summary,
            preferences = EXCLUDED.preferences,
            embedding = EXCLUDED.embedding,
            updated_at = now()
        """;

    private static final String FIND_SQL = """
        SELECT embedding
        FROM rec_db.rec_profiles
        WHERE user_id = ?
        """;

    private final JdbcTemplate jdbcTemplate;

    public RecProfileRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void upsert(UUID userId, UUID companyId, String summary, JsonNode preferences, float[] embedding) {
        Assert.notNull(userId, "userId bắt buộc");
        Assert.notNull(embedding, "embedding bắt buộc");

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(UPSERT_SQL);
            ps.setObject(1, userId);
            ps.setObject(2, companyId);
            ps.setString(3, summary);
            if (preferences != null) {
                ps.setString(4, preferences.toString());
            } else {
                ps.setNull(4, Types.OTHER);
            }
            ps.setObject(5, PgVectorUtil.toDatabaseVector(embedding), Types.OTHER);
            return ps;
        });
    }

    public Optional<float[]> findEmbedding(UUID userId) {
        if (userId == null) {
            return Optional.empty();
        }
        return jdbcTemplate.query(connection -> {
            PreparedStatement ps = connection.prepareStatement(FIND_SQL);
            ps.setObject(1, userId);
            return ps;
        }, rs -> {
            if (rs.next()) {
                String value = rs.getString("embedding");
                return Optional.ofNullable(PgVectorUtil.parseVector(value));
            }
            return Optional.empty();
        });
    }
}
