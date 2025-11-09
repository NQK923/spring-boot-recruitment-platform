<!DOCTYPE html>
<html lang="${doc.language!'vi'}">
<head>
    <meta charset="utf-8"/>
    <style>
        body {
            font-family: 'Noto Sans', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #111827;
            line-height: 1.5;
        }
        .page {
            width: 210mm;
            min-height: 297mm;
            padding: 32px 40px;
            margin: 0 auto;
            background: #ffffff;
        }
        h1 {
            font-size: 28px;
            margin-bottom: 6px;
        }
        h2 {
            font-size: 18px;
            text-transform: uppercase;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
            margin-top: 28px;
            margin-bottom: 12px;
            letter-spacing: 0.5px;
        }
        h3 {
            font-size: 16px;
            margin: 0 0 4px 0;
        }
        .subtitle {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 16px;
        }
        .contact {
            font-size: 13px;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .meta {
            font-size: 13px;
            color: #4b5563;
            margin-bottom: 8px;
        }
        ul {
            list-style: disc;
            margin: 8px 0 0 20px;
            padding: 0;
        }
        li {
            margin-bottom: 4px;
        }
        .section-item {
            margin-bottom: 16px;
        }
        .skills-line {
            font-size: 14px;
            color: #111827;
        }
    </style>
</head>
<body>
<div class="page">
    <header>
        <h1>${doc.fullName!''}</h1>
        <div class="subtitle">${doc.title!''}</div>
        <#assign contactParts = []>
        <#if doc.email?has_content>
            <#assign contactParts = contactParts + ["Email: ${doc.email}"]>
        </#if>
        <#if doc.phone?has_content>
            <#assign contactParts = contactParts + ["Điện thoại: ${doc.phone}"]>
        </#if>
        <#if doc.location?has_content>
            <#assign contactParts = contactParts + ["Địa điểm: ${doc.location}"]>
        </#if>
        <#if doc.links?? && doc.links.linkedin?has_content>
            <#assign contactParts = contactParts + ["LinkedIn: ${doc.links.linkedin}"]>
        </#if>
        <#if doc.links?? && doc.links.github?has_content>
            <#assign contactParts = contactParts + ["GitHub: ${doc.links.github}"]>
        </#if>
        <#if doc.links?? && doc.links.website?has_content>
            <#assign contactParts = contactParts + ["Website: ${doc.links.website}"]>
        </#if>
        <div class="contact">${contactParts?join(" | ")}</div>
    </header>

    <#if doc.summary?has_content>
        <section>
            <h2>Tóm tắt</h2>
            <p>${doc.summary}</p>
        </section>
    </#if>

    <#assign languageCode = (doc.language!'vi')?lower_case>
    <#assign currentLabel = (languageCode == 'en')?string('Present', 'Hiện tại')>

    <#if doc.experiences?has_content>
        <section>
            <h2>Kinh nghiệm</h2>
            <#list doc.experiences as exp>
                <div class="section-item">
                    <h3>${exp.title!''}<#if exp.company?has_content> · ${exp.company}</#if></h3>
                    <#assign periodText = exp.period!''>
                    <#if periodText?has_content>
                        <div class="meta">${periodText?replace("Hiện tại", currentLabel)}</div>
                    </#if>
                    <#if exp.bullets?has_content>
                        <ul>
                            <#list exp.bullets as bullet>
                                <li>${bullet}</li>
                            </#list>
                        </ul>
                    </#if>
                    <#if exp.tech?has_content>
                        <div class="skills-line">Công nghệ: ${exp.tech?join(", ")}</div>
                    </#if>
                </div>
            </#list>
        </section>
    </#if>

    <#if doc.projects?has_content>
        <section>
            <h2>Dự án</h2>
            <#list doc.projects as project>
                <div class="section-item">
                    <h3>${project.name!''}<#if project.role?has_content> · ${project.role}</#if></h3>
                    <#if project.link?has_content>
                        <div class="meta">${project.link}</div>
                    </#if>
                    <#if project.bullets?has_content>
                        <ul>
                            <#list project.bullets as bullet>
                                <li>${bullet}</li>
                            </#list>
                        </ul>
                    </#if>
                    <#if project.tech?has_content>
                        <div class="skills-line">Công nghệ: ${project.tech?join(", ")}</div>
                    </#if>
                </div>
            </#list>
        </section>
    </#if>

    <#if doc.education?has_content>
        <section>
            <h2>Học vấn</h2>
            <#list doc.education as edu>
                <div class="section-item">
                    <h3>${edu.degree!''}<#if edu.school?has_content> · ${edu.school}</#if></h3>
                    <#assign eduPeriod = edu.period!''>
                    <#if eduPeriod?has_content>
                        <div class="meta">${eduPeriod?replace("Hiện tại", currentLabel)}</div>
                    </#if>
                    <#if edu.major?has_content>
                        <div>${edu.major}</div>
                    </#if>
                </div>
            </#list>
        </section>
    </#if>

    <#if doc.certifications?has_content>
        <section>
            <h2>Chứng chỉ</h2>
            <#list doc.certifications as cert>
                <div class="section-item">
                    <h3>${cert.name!''}</h3>
                    <div class="meta">
                        <#if cert.issuer?has_content>${cert.issuer}</#if>
                        <#if cert.issueDate?has_content> · ${cert.issueDate}</#if>
                    </div>
                </div>
            </#list>
        </section>
    </#if>

    <#if doc.skills?has_content>
        <section>
            <h2>Kỹ năng</h2>
            <div class="skills-line">${doc.skills?join(", ")}</div>
        </section>
    </#if>

    <#if doc.languages?has_content>
        <section>
            <h2>Ngoại ngữ</h2>
            <div class="skills-line">
                <#list doc.languages as lang>
                    ${lang.language!''}<#if lang.level?has_content> (${lang.level})</#if><#if lang_has_next>, </#if>
                </#list>
            </div>
        </section>
    </#if>
</div>
</body>
</html>
