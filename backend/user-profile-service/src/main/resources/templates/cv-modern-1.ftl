<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="utf-8"/>
    <style>
        body {
            font-family: 'Noto Sans', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #f5f5f5;
            color: #111827;
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
            margin-bottom: 4px;
        }

        h2 {
            font-size: 18px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 4px;
            margin-top: 28px;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #1f2937;
        }

        .subtitle {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 16px;
        }

        .details {
            font-size: 13px;
            color: #374151;
            margin-bottom: 16px;
        }

        .details span {
            display: inline-block;
            margin-right: 12px;
        }

        .section-item {
            margin-bottom: 16px;
        }

        .section-item h3 {
            margin: 0;
            font-size: 15px;
            color: #111827;
        }

        .meta {
            font-size: 13px;
            color: #6b7280;
            margin-top: 2px;
        }

        ul {
            margin: 8px 0 0 18px;
            padding: 0;
        }

        ul li {
            margin-bottom: 4px;
        }

        .chip-list {
            margin-top: 6px;
        }

        .chip {
            display: inline-block;
            background: #eef2ff;
            color: #3730a3;
            border-radius: 12px;
            padding: 2px 10px;
            font-size: 12px;
            margin-right: 6px;
            margin-bottom: 4px;
        }

        .two-column {
            display: flex;
            gap: 24px;
        }

        .two-column > div {
            flex: 1;
        }

        .skills, .languages {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }

        .skills span, .languages span {
            background: #f3f4f6;
            border-radius: 8px;
            padding: 4px 10px;
            font-size: 12px;
        }
    </style>
</head>
<body>
<div class="page">
    <header>
        <h1>${doc.fullName!''}</h1>
        <div class="subtitle">${doc.title!''}</div>
        <div class="details">
            <#if doc.links?has_content>
                <#if doc.links.linkedin?has_content><span>LinkedIn: ${doc.links.linkedin}</span></#if>
                <#if doc.links.github?has_content><span>GitHub: ${doc.links.github}</span></#if>
                <#if doc.links.website?has_content><span>Website: ${doc.links.website}</span></#if>
            </#if>
        </div>
    </header>

    <#if doc.summary?has_content>
        <section>
            <h2>Tóm tắt</h2>
            <p>${doc.summary}</p>
        </section>
    </#if>

    <#if doc.experiences?has_content>
        <section>
            <h2>Kinh nghiệm</h2>
            <#list doc.experiences as exp>
                <div class="section-item">
                    <h3>${exp.title!''} · ${exp.company!''}</h3>
                    <div class="meta">${exp.period!''}</div>
                    <#if exp.bullets?has_content>
                        <ul>
                            <#list exp.bullets as bullet>
                                <li>• ${bullet}</li>
                            </#list>
                        </ul>
                    </#if>
                    <#if exp.tech?has_content>
                        <div class="chip-list">
                            <#list exp.tech as tech>
                                <span class="chip">${tech}</span>
                            </#list>
                        </div>
                    </#if>
                </div>
            </#list>
        </section>
    </#if>

    <div class="two-column">
        <#if doc.projects?has_content>
            <section>
                <h2>Dự án</h2>
                <#list doc.projects as project>
                    <div class="section-item">
                        <h3>${project.name!''} · ${project.role!''}</h3>
                        <div class="meta">${project.link!''}</div>
                        <#if project.bullets?has_content>
                            <ul>
                                <#list project.bullets as bullet>
                                    <li>• ${bullet}</li>
                                </#list>
                            </ul>
                        </#if>
                        <#if project.tech?has_content>
                            <div class="chip-list">
                                <#list project.tech as tech>
                                    <span class="chip">${tech}</span>
                                </#list>
                            </div>
                        </#if>
                    </div>
                </#list>
            </section>
        </#if>

        <div>
            <#if doc.education?has_content>
                <section>
                    <h2>Học vấn</h2>
                    <#list doc.education as edu>
                        <div class="section-item">
                            <h3>${edu.degree!''}</h3>
                            <div class="meta">${edu.school!''} · ${edu.period!''}</div>
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
                            <div class="meta">${cert.issuer!''} · ${cert.issueDate!''}</div>
                        </div>
                    </#list>
                </section>
            </#if>
        </div>
    </div>

    <div class="two-column">
        <#if doc.skills?has_content>
            <section>
                <h2>Kỹ năng</h2>
                <div class="skills">
                    <#list doc.skills as skill>
                        <span>${skill}</span>
                    </#list>
                </div>
            </section>
        </#if>

        <#if doc.languages?has_content>
            <section>
                <h2>Ngoại ngữ</h2>
                <div class="languages">
                    <#list doc.languages as lang>
                        <span>${lang.language!''} · ${lang.level!''}</span>
                    </#list>
                </div>
            </section>
        </#if>
    </div>
</div>
</body>
</html>
