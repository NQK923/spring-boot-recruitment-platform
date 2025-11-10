package com.recruitment.platform.userprofile.service.cv;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.recruitment.platform.common.exception.BadRequestException;
import com.recruitment.platform.common.exception.ServiceException;
import com.recruitment.platform.userprofile.config.CvProperties;
import com.recruitment.platform.userprofile.service.cv.model.CvDocument;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Component
public class CvRenderer {

    private final Configuration freemarker;
    private final CvProperties properties;

    public CvRenderer(CvProperties properties) {
        this.properties = properties;
        this.freemarker = new Configuration(Configuration.VERSION_2_3_32);
        this.freemarker.setDefaultEncoding(StandardCharsets.UTF_8.name());
        this.freemarker.setClassLoaderForTemplateLoading(getClass().getClassLoader(), "/templates");
    }

    public byte[] render(String templateCode, CvDocument document) {
        Objects.requireNonNull(document, "document must not be null");
        String templateName = resolveTemplate(templateCode);
        try {
            Template template = freemarker.getTemplate(templateName);
            StringWriter writer = new StringWriter();
            Map<String, Object> model = new HashMap<>();
            model.put("doc", document);
            model.put("generatedDate", LocalDate.now().format(DateTimeFormatter.ISO_DATE));
            template.process(model, writer);
            return toPdf(writer.toString());
        } catch (IOException | TemplateException ex) {
            throw new ServiceException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể dựng HTML CV.", null, Map.of(), ex);
        }
    }

    private byte[] toPdf(String html) {
        File fontFile = new File(properties.getPdf().getFontPath());
        if (!fontFile.exists()) {
            throw new ServiceException(HttpStatus.INTERNAL_SERVER_ERROR, "Không tìm thấy font Noto Sans tại " + fontFile.getAbsolutePath());
        }
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(html, null);
            builder.useFont(fontFile, "Noto Sans");
            builder.toStream(baos);
            builder.run();
            return baos.toByteArray();
        } catch (Exception ex) {
            throw new ServiceException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể kết xuất PDF từ CV.", null, Map.of(), ex);
        }
    }

    private String resolveTemplate(String templateCode) {
        String code = StringUtils.hasText(templateCode) ? templateCode.trim().toLowerCase() : properties.getDefaults().getTemplate();
        return switch (code) {
            case "modern-1" -> "cv-modern-1.ftl";
            case "modern-visual" -> "cv-modern-visual.ftl";
            default -> throw new BadRequestException("Template CV không được hỗ trợ.");
        };
    }
}
