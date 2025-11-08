package com.recruitment.platform.chat.recommendation.repository;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitment.platform.chat.recommendation.vector.PgVectorUtil;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.util.Assert;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.List;

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

    private static final String SEARCH_SQL_WITH_PROFILE = """
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
        WHERE COALESCE(UPPER(metadata->>'status'), 'OPEN') IN ('OPEN', 'PUBLISHED', 'ACTIVE')
        ORDER BY score DESC
        LIMIT ?
        """;

    private static final String SEARCH_SQL_NO_PROFILE = """
        SELECT job_id,
               metadata,
               0.50 * (1 - (embedding <=> ?::vector)) +
               0.15 * EXP(
                   - GREATEST(
                       EXTRACT(EPOCH FROM (now() - COALESCE((metadata->>'postedAt')::timestamptz, updated_at))) / 86400,
                       0
                   ) / ?
               ) AS score
        FROM rec_db.rec_jobs
        WHERE COALESCE(UPPER(metadata->>'status'), 'OPEN') IN ('OPEN', 'PUBLISHED', 'ACTIVE')
        ORDER BY score DESC
        LIMIT ?
        """;

    private static final String COUNT_SQL = "SELECT COUNT(1) FROM rec_db.rec_jobs";

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public RecJobRepository(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    public void upsert(Long jobId, Long companyId, String content, JsonNode metadata, float[] embedding) {
        Assert.notNull(jobId, "jobId bắt buộc");
        Assert.notNull(content, "content bắt buộc");
        Assert.notNull(metadata, "metadata bắt buộc");
        Assert.notNull(embedding, "embedding bắt buộc");

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(UPSERT_SQL);
            ps.setLong(1, jobId);
            if (companyId != null) {
                ps.setLong(2, companyId);
            } else {
                ps.setNull(2, Types.BIGINT);
            }
            ps.setString(3, content);
            ps.setString(4, metadata.toString());
            ps.setObject(5, PgVectorUtil.toDatabaseVector(embedding), Types.OTHER);
            return ps;
        });
    }

    public List<JobHit> search(int topK, float[] queryVector, float[] profileVector, int freshnessDays) {
        Assert.isTrue(topK > 0, "topK phải lớn hơn 0");
        Assert.notNull(queryVector, "queryVector bắt buộc");

        boolean hasProfileVector = profileVector != null && profileVector.length > 0;
        String sql = hasProfileVector ? SEARCH_SQL_WITH_PROFILE : SEARCH_SQL_NO_PROFILE;

        return jdbcTemplate.query(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql);
            ps.setObject(1, PgVectorUtil.toDatabaseVector(queryVector), Types.OTHER);
            int paramIndex = 2;
            if (hasProfileVector) {
                ps.setObject(paramIndex++, PgVectorUtil.toDatabaseVector(profileVector), Types.OTHER);
            }
            ps.setInt(paramIndex++, Math.max(freshnessDays, 1));
            ps.setInt(paramIndex, topK);
            return ps;
        }, this::mapJobHit);
    }

    public boolean hasJobs() {
        try {
            Long total = jdbcTemplate.queryForObject(COUNT_SQL, Long.class);
            return total != null && total > 0;
        } catch (DataAccessException ex) {
            return false;
        }
    }

    private JobHit mapJobHit(ResultSet rs, int rowNum) throws SQLException {
        long rawJobId = rs.getLong("job_id");
        Long jobId = rs.wasNull() ? null : rawJobId;
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

    public record JobHit(Long jobId, double score, JsonNode metadata) {
    }
}
