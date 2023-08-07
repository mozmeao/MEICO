const fs = require('fs');
let marked = require('marked');
let args = process.argv.slice(2);

md_filename = args[0]
console.log("Generating sidebar for " + md_filename)
// generate url from filename, assume the url request-uri is the name of the final folder the file is in
split_filename = md_filename.split('/')
url = "/ai/content/"+split_filename[split_filename.length - 2]+"/index.html"
console.log("For URL (from path): "+url)

function get_markdown(filename) {
    return fs.readFileSync(filename, 'utf8');
}

function generate_id(title) {
    return title.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-')
}

let tokens = marked.lexer(get_markdown(args[0]));
let headers = tokens.filter(t => t.type == 'heading')
// console.log(JSON.stringify(headers, null, 2));

mapped = headers.map(h => [
    h.depth,
    h.text,
    generate_id(h.text)
]);

// console.log(JSON.stringify(mapped, null, 2));

let html = "<li>"
html += mapped.map(h => {
    if (h[0] == 2) {
        return `<details closed>
            <summary>
                <a href="${url}">${h[1]}</a>
            </summary>
        <ul class='sub_menu'>`;
    } else if (h[0] == 4) {
        return `<li><a href="${url}#${h[2]}">${h[1]}</a></li>`;
    }
}).join('\n');   
html+="</ul></details></li>"

console.log(html)

// replace the last element of the split_filename with _sidebar.html
console.log(split_filename)
base_path = split_filename.slice(0,-1).join('/')
new_filename = base_path + "/_sidebar.html"
console.log(">>>>> WRITING SIDEBAR: "+new_filename) 
fs.writeFileSync(new_filename, html, 'utf8');

full_page_template = `
{% extends "base-ai.html" %}

{% block page_title %}Mozilla AI Guide{% endblock %}
{% block page_desc %}Mozilla AI Guide{% endblock %}
{% block main_id %}content{% endblock %}
    
{% block content %}
    {% include "PARTIAL_PATH"%}
{% endblock %}
`
full_page_filename = new_filename.replace("templates", "pages").replace("_sidebar.html", "index.html")
console.log(">>>>> WRITING FULL PAGE: "+full_page_filename)
partial_path = split_filename.slice(1,-1).join("/")+"/index-content.html"
fs.writeFileSync(full_page_filename, full_page_template.replace("PARTIAL_PATH", partial_path), 'utf8');