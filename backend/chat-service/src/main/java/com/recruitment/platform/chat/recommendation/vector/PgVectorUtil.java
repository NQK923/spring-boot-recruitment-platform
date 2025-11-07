package com.recruitment.platform.chat.recommendation.vector;

import org.postgresql.util.PGobject;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.SQLException;

public final class PgVectorUtil {

    private PgVectorUtil() {
    }

    public static Object toDatabaseVector(float[] vector) {
        if (vector == null) {
            return null;
        }
        try {
            PGobject pgObject = new PGobject();
            pgObject.setType("vector");
            pgObject.setValue(formatVector(vector));
            return pgObject;
        } catch (SQLException ex) {
            throw new IllegalArgumentException("Không thể chuyển đổi vector sang PGobject", ex);
        }
    }

    public static String formatVector(float[] vector) {
        if (vector == null) {
            return null;
        }
        StringBuilder builder = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            if (i > 0) {
                builder.append(',');
            }
            builder.append(trimPrecision(vector[i]));
        }
        builder.append(']');
        return builder.toString();
    }

    public static float[] parseVector(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.startsWith("[")) {
            trimmed = trimmed.substring(1);
        }
        if (trimmed.endsWith("]")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        if (trimmed.isBlank()) {
            return new float[0];
        }
        String[] tokens = trimmed.split(",");
        float[] vector = new float[tokens.length];
        for (int i = 0; i < tokens.length; i++) {
            vector[i] = Float.parseFloat(tokens[i].trim());
        }
        return vector;
    }

    private static String trimPrecision(float value) {
        BigDecimal decimal = new BigDecimal(value).setScale(6, RoundingMode.HALF_UP);
        return decimal.stripTrailingZeros().toPlainString();
    }
}
