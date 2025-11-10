<!DOCTYPE html>
<html lang="${(doc.language!'vi')}" >
<head>
    <meta charset="utf-8"/>
    <style>
        body{font-family:'Noto Sans',Arial,sans-serif;color:#111827;background:#ffffff;margin:0}
        .page{width:210mm;min-height:297mm;padding:32px 40px;margin:0 auto}
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
    </style>
</head>
<body>
<#assign currentLabel = ((doc.language!'vi')?lower_case == 'en')?then('Present','Hiện tại')>
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
            <#assign contactParts = contactParts + ["LinkedIn: <a href=\"${doc.links.linkedin}\">${doc.links.linkedin}</a>"]>
        </#if>
        <#if doc.links?? && doc.links.github?has_content>
            <#assign contactParts = contactParts + ["GitHub: <a href=\"${doc.links.github}\">${doc.links.github}</a>"]>
        </#if>
        <#if doc.links?? && doc.links.website?has_content>
            <#assign contactParts = contactParts + ["Website: <a href=\"${doc.links.website}\">${doc.links.website}</a>"]>
        </#if>
        <#if contactParts?size gt 0>
            <div class="details">${contactParts?join(" | ")}</div>
        </#if>
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
                        <div class="kw"><span class="muted"><strong>Công nghệ:</strong></span>
                            <#list exp.tech as t>${t}<#if t_has_next>, </#if></#list>
                        </div>
                    </#if>
                </div>
            </#list>
        </section>
    </#if>

    <#if doc.projects?has_content>
        <section>
            <h2>Dự án</h2>
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
                        <div class="kw"><span class="muted"><strong>Công nghệ:</strong></span>
                            <#list prj.tech as t>${t}<#if t_has_next>, </#if></#list>
                        </div>
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
                    <strong>${edu.degree!''}</strong>
                    <div class="meta">${edu.school!''} · ${(edu.period!'')?replace('Hiện tại', currentLabel)}<#if edu.gpa?has_content> · GPA: ${edu.gpa}</#if></div>
                </div>
            </#list>
        </section>
    </#if>

    <#if doc.skills?has_content>
        <section>
            <h2>Kỹ năng</h2>
            <#-- doc.skills có thể là object nhóm; nếu là mảng, in chuỗi phẩy -->
            <#if doc.skills?is_hash>
                <#if doc.skills.languages?has_content><div class="kw"><strong>Ngôn ngữ:</strong> <#list doc.skills.languages as x>${x}<#if x_has_next>, </#if></#list></div></#if>
                <#if doc.skills.frameworks?has_content><div class="kw"><strong>Framework:</strong> <#list doc.skills.frameworks as x>${x}<#if x_has_next>, </#if></#list></div></#if>
                <#if doc.skills.databases?has_content><div class="kw"><strong>Database:</strong> <#list doc.skills.databases as x>${x}<#if x_has_next>, </#if></#list></div></#if>
                <#if doc.skills.devops?has_content><div class="kw"><strong>DevOps:</strong> <#list doc.skills.devops as x>${x}<#if x_has_next>, </#if></#list></div></#if>
                <#if doc.skills.others?has_content><div class="kw"><strong>Khác:</strong> <#list doc.skills.others as x>${x}<#if x_has_next>, </#if></#list></div></#if>
            <#else>
                <p class="kw">
                    <#list doc.skills as s>${s}<#if s_has_next>, </#if></#list>
                </p>
            </#if>
        </section>
    </#if>

    <#if doc.languages?has_content>
        <section>
            <h2>Ngoại ngữ</h2>
            <p class="kw">
                <#list doc.languages as l>${l.language!''} · ${l.level!''}<#if l_has_next>, </#if></#list>
            </p>
        </section>
    </#if>

    <#if doc.certifications?has_content>
        <section>
            <h2>Chứng chỉ</h2>
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
