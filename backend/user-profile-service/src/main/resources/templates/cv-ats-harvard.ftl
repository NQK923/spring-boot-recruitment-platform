<!DOCTYPE html>
<html lang="${(doc.language!'vi')}" >
<head>
    <meta charset="utf-8"/>
    <style>
        *,*::before,*::after{box-sizing:border-box}
        body{font-family:'Noto Sans',Arial,sans-serif;color:#111827;background:#ffffff;margin:0;line-height:1.5}
        .page{width:190mm;min-height:297mm;padding:32px 40px;margin:0 auto}
        h1{font-size:28px;margin:0 0 4px}
        h2{font-size:16px;text-transform:uppercase;letter-spacing:.6px;color:#111827;margin:20px 0 10px;padding-bottom:6px;border-bottom:1.5px solid #e5e7eb}
        .subtitle{color:#374151;margin-bottom:10px}
        .details{font-size:13px;color:#374151;margin-bottom:10px}
        .meta{font-size:12.5px;color:#6b7280;margin-top:2px}
        ul{margin:8px 0 0 20px;padding:0;list-style:disc}
        li{margin-bottom:4px}
        .kw{margin-top:6px;font-size:13px}
        .muted{color:#475569}
        a{color:#111827;text-decoration:none;border-bottom:1px dashed #94a3b8}
        a:hover{border-bottom-color:#2563eb}
        p,li,.details,.meta,.kw,.subtitle,h1,h2{overflow-wrap:anywhere;word-break:break-word}
    </style>
</head>
<body>
<#assign languageCode = (doc.language!'vi')?lower_case>
<#assign isEnglish = (languageCode == 'en')>
<#assign currentLabel = isEnglish?string('Present','Hiện tại')>
<#assign phoneLabel = isEnglish?string('Phone','Điện thoại')>
<#assign locationLabel = isEnglish?string('Location','Địa điểm')>
<#assign sectionLabels = {
    "summary": isEnglish?string("Summary","Tóm tắt"),
    "experience": isEnglish?string("Experience","Kinh nghiệm"),
    "projects": isEnglish?string("Projects","Dự án"),
    "tech": isEnglish?string("Tech stack","Công nghệ"),
    "education": isEnglish?string("Education","Học vấn"),
    "skills": isEnglish?string("Skills","Kỹ năng"),
    "languages": isEnglish?string("Languages","Ngoại ngữ"),
    "certifications": isEnglish?string("Certifications","Chứng chỉ")
}>
<#assign skillCategoryLabels = {
    "languages": isEnglish?string("Languages","Ngôn ngữ"),
    "frameworks": isEnglish?string("Frameworks","Framework"),
    "databases": isEnglish?string("Databases","Database"),
    "devops": isEnglish?string("DevOps","DevOps"),
    "others": isEnglish?string("Others","Khác")
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
            <#assign linkContacts = linkContacts + ["LinkedIn: <a href=\"${doc.links.linkedin}\">${doc.links.linkedin}</a>"]>
        </#if>
        <#if doc.links?? && doc.links.github?has_content>
            <#assign linkContacts = linkContacts + ["GitHub: <a href=\"${doc.links.github}\">${doc.links.github}</a>"]>
        </#if>
        <#if doc.links?? && doc.links.website?has_content>
            <#assign linkContacts = linkContacts + ["Website: <a href=\"${doc.links.website}\">${doc.links.website}</a>"]>
        </#if>
        <#if primaryContacts?has_content>
            <div class="details">${primaryContacts?join(" | ")}</div>
        </#if>
        <#if linkContacts?has_content>
            <div class="details">${linkContacts?join(" | ")}</div>
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
                    <strong>${exp.title!''} · ${exp.company!''}</strong>
                    <div class="meta">${(exp.period!'')?replace('Hiện tại', currentLabel)}</div>
                    <#if exp.bullets?has_content>
                        <ul>
                            <#list exp.bullets as b>
                                <li>${b}</li>
                            </#list>
                        </ul>
                    </#if>
                    <#if exp.tech?has_content>
                        <div class="kw"><span class="muted"><strong>${sectionLabels.tech}:</strong></span>
                            <#list exp.tech as t>${t}<#if t_has_next>, </#if></#list>
                        </div>
                    </#if>
                </div>
            </#list>
        </section>
    </#if>

    <#if doc.projects?has_content>
        <section>
            <h2>${sectionLabels.projects}</h2>
            <#list doc.projects as prj>
                <div class="section-item">
                    <strong>${prj.name!''} · ${prj.role!''}</strong>
                    <div class="meta">
                        ${(prj.period!'')?replace('Hiện tại', currentLabel)}
                        <#if prj.link?has_content> · <a href="${prj.link}">${prj.link}</a></#if>
                    </div>
                    <#if prj.bullets?has_content>
                        <ul>
                            <#list prj.bullets as b>
                                <li>${b}</li>
                            </#list>
                        </ul>
                    </#if>
                    <#if prj.tech?has_content>
                        <div class="kw"><span class="muted"><strong>${sectionLabels.tech}:</strong></span>
                            <#list prj.tech as t>${t}<#if t_has_next>, </#if></#list>
                        </div>
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
                    <strong>${edu.degree!''}</strong>
                    <div class="meta">${edu.school!''} · ${(edu.period!'')?replace('Hiện tại', currentLabel)}<#if edu.gpa?has_content> · GPA: ${edu.gpa}</#if></div>
                </div>
            </#list>
        </section>
    </#if>

    <#if doc.skills?has_content>
        <section>
            <h2>${sectionLabels.skills}</h2>
            <#-- doc.skills có thể là object nhóm; nếu là mảng, in chuỗi phẩy -->
            <#if doc.skills?is_hash>
                <#if doc.skills.languages?has_content><div class="kw"><strong>${skillCategoryLabels.languages}:</strong> <#list doc.skills.languages as x>${x}<#if x_has_next>, </#if></#list></div></#if>
                <#if doc.skills.frameworks?has_content><div class="kw"><strong>${skillCategoryLabels.frameworks}:</strong> <#list doc.skills.frameworks as x>${x}<#if x_has_next>, </#if></#list></div></#if>
                <#if doc.skills.databases?has_content><div class="kw"><strong>${skillCategoryLabels.databases}:</strong> <#list doc.skills.databases as x>${x}<#if x_has_next>, </#if></#list></div></#if>
                <#if doc.skills.devops?has_content><div class="kw"><strong>${skillCategoryLabels.devops}:</strong> <#list doc.skills.devops as x>${x}<#if x_has_next>, </#if></#list></div></#if>
                <#if doc.skills.others?has_content><div class="kw"><strong>${skillCategoryLabels.others}:</strong> <#list doc.skills.others as x>${x}<#if x_has_next>, </#if></#list></div></#if>
            <#else>
                <p class="kw">
                    <#list doc.skills as s>${s}<#if s_has_next>, </#if></#list>
                </p>
            </#if>
        </section>
    </#if>

    <#if doc.languages?has_content>
        <section>
            <h2>${sectionLabels.languages}</h2>
            <p class="kw">
                <#list doc.languages as l>${l.language!''} · ${l.level!''}<#if l_has_next>, </#if></#list>
            </p>
        </section>
    </#if>

    <#if doc.certifications?has_content>
        <section>
            <h2>${sectionLabels.certifications}</h2>
            <#list doc.certifications as c>
                <div class="section-item">
                    <strong>${c.name!''}</strong>
                    <div class="meta">${c.issuer!''}<#if c.issueDate?has_content> · ${c.issueDate}</#if></div>
                </div>
            </#list>
        </section>
    </#if>
</div>
</body>
</html>
