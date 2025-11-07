package com.recruitment.platform.chat.recommendation.repository;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitment.platform.chat.recommendation.vector.PgVectorUtil;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.util.Assert;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.List;
import java.util.UUID;

@Repository
public class RecJobRepository {

    private static final String UPSERT_SQL = """
        INSERT INTO rec_db.rec_jobs (job_id, company_id, content, metadata, embedding, updated_at)
        VALUES (?, ?, ?, ?::jsonb, ?::vector, now())
        ON CONFLICT (job_id) DO UPDATE
        SET company_id = EXCLUDED.company_id,
            content = EXCLUDED.content,
            metadata = EXCLUDED.metadata,
            embedding = EXCLUDED.embedding,
            updated_at = now()
        """;

    private static final String SEARCH_SQL = """
        SELECT job_id,
               metadata,
               0.50 * (1 - (embedding <=> ?::vector)) +
               0.35 * COALESCE(1 - (embedding <=> ?::vector), 0) +
               0.15 * EXP(
                   - GREATEST(
                       EXTRACT(EPOCH FROM (now() - COALESCE((metadata->>'postedAt')::timestamptz, updated_at))) / 86400,
                       0
                   ) / ?
               ) AS score
        FROM rec_db.rec_jobs
        WHERE COALESCE(metadata->>'status', 'OPEN') = 'OPEN'
        ORDER BY score DESC
        LIMIT ?
        """;

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public RecJobRepository(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    public void upsert(UUID jobId, UUID companyId, String content, JsonNode metadata, float[] embedding) {
        Assert.notNull(jobId, "jobId bắt buộc");
        Assert.notNull(content, "content bắt buộc");
        Assert.notNull(metadata, "metadata bắt buộc");
        Assert.notNull(embedding, "embedding bắt buộc");

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(UPSERT_SQL);
            ps.setObject(1, jobId);
            ps.setObject(2, companyId);
            ps.setString(3, content);
            ps.setString(4, metadata.toString());
            ps.setObject(5, PgVectorUtil.toDatabaseVector(embedding), Types.OTHER);
            return ps;
        });
    }

    public List<JobHit> search(int topK, float[] queryVector, float[] profileVector, int freshnessDays) {
        Assert.isTrue(topK > 0, "topK phải lớn hơn 0");
        Assert.notNull(queryVector, "queryVector bắt buộc");

        return jdbcTemplate.query(connection -> {
            PreparedStatement ps = connection.prepareStatement(SEARCH_SQL);
            ps.setObject(1, PgVectorUtil.toDatabaseVector(queryVector), Types.OTHER);
            if (profileVector != null) {
                ps.setObject(2, PgVectorUtil.toDatabaseVector(profileVector), Types.OTHER);
            } else {
                ps.setNull(2, Types.OTHER);
            }
            ps.setInt(3, Math.max(freshnessDays, 1));
            ps.setInt(4, topK);
            return ps;
        }, (rs, rowNum) -> mapJobHit(rs));
    }

    private JobHit mapJobHit(ResultSet rs) throws SQLException {
        UUID jobId = rs.getObject("job_id", UUID.class);
        String metadata = rs.getString("metadata");
        double score = rs.getDouble("score");
        JsonNode metadataNode;
        try {
            metadataNode = objectMapper.readTree(metadata);
        } catch (Exception ex) {
            throw new SQLException("Không thể parse metadata cho job " + jobId, ex);
        }
        return new JobHit(jobId, score, metadataNode);
    }

    public record JobHit(UUID jobId, double score, JsonNode metadata) {
    }
}
