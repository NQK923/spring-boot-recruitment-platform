<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8" />
    <title>${headline?html}</title>
    <style>
        body {
            margin: 0;
            font-family: "Segoe UI", Arial, sans-serif;
            background-color: #f4f6fb;
            color: #1f2937;
        }
        .wrapper {
            padding: 32px 16px;
        }
        .container {
            max-width: 560px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
            overflow: hidden;
            border: 1px solid rgba(99, 102, 241, 0.12);
        }
        .header {
            background: linear-gradient(135deg, #3b82f6, #6366f1);
            padding: 28px;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 20px;
            line-height: 1.4;
        }
        .content {
            padding: 28px;
            font-size: 15px;
            line-height: 1.7;
        }
        .content p {
            margin: 0 0 16px;
        }
        .cta {
            margin: 24px 0;
            text-align: center;
        }
        .cta a {
            display: inline-block;
            padding: 12px 28px;
            border-radius: 999px;
            font-weight: 600;
            text-decoration: none;
            color: #ffffff;
            background: linear-gradient(135deg, #2563eb, #7c3aed);
        }
        .footer {
            padding: 24px 28px 32px;
            background: #f8fafc;
            font-size: 13px;
            color: #475569;
        }
        .footer a {
            color: #2563eb;
            text-decoration: none;
        }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="container">
        <div class="header">
            <h1>${headline?html}</h1>
        </div>
        <div class="content">
            <#if paragraphs??>
                <#list paragraphs as paragraph>
                    <p>${paragraph?html}</p>
                </#list>
            </#if>
            <#if actionUrl?? && actionUrl?has_content && actionLabel?? && actionLabel?has_content>
                <div class="cta">
                    <a href="${actionUrl?html}">${actionLabel?html}</a>
                </div>
            </#if>
            <p>${closingNote?html}</p>
        </div>
        <div class="footer">
            <p>Trân trọng,<br/>${brandName?html}</p>
            <p>Hỗ trợ: <a href="mailto:${supportEmail?html}">${supportEmail?html}</a></p>
        </div>
    </div>
</div>
</body>
</html>
