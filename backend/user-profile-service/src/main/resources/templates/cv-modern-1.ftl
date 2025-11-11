<!DOCTYPE html>
<html lang="${doc.language!'vi'}">
<head>
    <meta charset="utf-8"/>
    <style>
        *, *::before, *::after {
            box-sizing: border-box;
        }
        body {
            font-family: 'Noto Sans', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #111827;
            line-height: 1.5;
        }
        .page {
            width: 190mm;
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
        p, li, .contact, .meta, .skills-line, .subtitle, h1, h2, h3 {
            overflow-wrap: anywhere;
            word-break: break-word;
        }
    </style>
</head>
<body>
<#assign languageCode = (doc.language!'vi')?lower_case>
<#assign isEnglish = (languageCode == 'en')>
<#assign currentLabel = isEnglish?string('Present', 'Hiện tại')>
<#assign phoneLabel = isEnglish?string('Phone', 'Điện thoại')>
<#assign locationLabel = isEnglish?string('Location', 'Địa điểm')>
<#assign sectionLabels = {
    "summary": isEnglish?string("Summary", "Tóm tắt"),
    "experience": isEnglish?string("Experience", "Kinh nghiệm"),
    "projects": isEnglish?string("Projects", "Dự án"),
    "tech": isEnglish?string("Tech stack", "Công nghệ"),
    "education": isEnglish?string("Education", "Học vấn"),
    "certifications": isEnglish?string("Certifications", "Chứng chỉ"),
    "skills": isEnglish?string("Skills", "Kỹ năng"),
    "languages": isEnglish?string("Languages", "Ngoại ngữ")
}>
<div class="page">
    <header>
        <h1>${doc.fullName!''}</h1>
        <div class="subtitle">${doc.title!''}</div>
        <#assign primaryContacts = []>
        <#assign linkContacts = []>
        <#if doc.email?has_content>
            <#assign primaryContacts = primaryContacts + ["Email: ${doc.email}"]>
        </#if>
        <#if doc.phone?has_content>
            <#assign primaryContacts = primaryContacts + ["${phoneLabel}: ${doc.phone}"]>
        </#if>
        <#if doc.location?has_content>
            <#assign primaryContacts = primaryContacts + ["${locationLabel}: ${doc.location}"]>
        </#if>
        <#if doc.links?? && doc.links.linkedin?has_content>
            <#assign linkContacts = linkContacts + ["LinkedIn: ${doc.links.linkedin}"]>
        </#if>
        <#if doc.links?? && doc.links.github?has_content>
            <#assign linkContacts = linkContacts + ["GitHub: ${doc.links.github}"]>
        </#if>
        <#if doc.links?? && doc.links.website?has_content>
            <#assign linkContacts = linkContacts + ["Website: ${doc.links.website}"]>
        </#if>
        <#if primaryContacts?has_content>
            <div class="contact">${primaryContacts?join(" | ")}</div>
        </#if>
        <#if linkContacts?has_content>
            <div class="contact">${linkContacts?join(" | ")}</div>
        </#if>
    </header>

    <#if doc.summary?has_content>
        <section>
            <h2>${sectionLabels.summary}</h2>
            <p>${doc.summary}</p>
        </section>
    </#if>

    <#if doc.experiences?has_content>
        <section>
            <h2>${sectionLabels.experience}</h2>
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
                        <div class="skills-line">${sectionLabels.tech}: ${exp.tech?join(", ")}</div>
                    </#if>
                </div>
            </#list>
        </section>
    </#if>

    <#if doc.projects?has_content>
        <section>
            <h2>${sectionLabels.projects}</h2>
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
                        <div class="skills-line">${sectionLabels.tech}: ${project.tech?join(", ")}</div>
                    </#if>
                </div>
            </#list>
        </section>
    </#if>

    <#if doc.education?has_content>
        <section>
            <h2>${sectionLabels.education}</h2>
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
            <h2>${sectionLabels.certifications}</h2>
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
            <h2>${sectionLabels.skills}</h2>
            <div class="skills-line">${doc.skills?join(", ")}</div>
        </section>
    </#if>

    <#if doc.languages?has_content>
        <section>
            <h2>${sectionLabels.languages}</h2>
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
