
var preincludes={};

var buttons ={
    "edit":             "edit",
    "copy":             "copy",
    "Open in Overleaf": "Open in Overleaf",
    "LaTeX Online":     "LaTeX Online",
    "Delete Output":    "Delete Output",
    "Compiling PDF":    "Compiling PDF"
}

var editors=[];

function llexamples() {
    var p = document.getElementsByTagName("pre");
    var editor;
    for(var i=0;i<p.length;i++) {
	p[i].setAttribute("id","pre" + i);
	// class=noedit on pre or {: .class :} after closing ``` in markdown
	if(!(p[i].classList.contains('noedit') || p[i].parentNode.parentNode.classList.contains('noedit'))) {
	// edit
	var b = document.createElement("button");
	b.innerText=buttons["edit"];
	b.setAttribute("onclick",'allowedit("pre' + i + '")');
	    //	p[i].parentNode.insertBefore(b, p[i]);
	// copy
	var c = document.createElement("button");
	c.innerText=buttons["copy"];
	c.setAttribute("onclick",'copytoclipboard("pre' + i + '")');
//	p[i].parentNode.insertBefore(c, p[i]);
	if(p[i].textContent.indexOf("\\documentclass") !== -1) {
	    // space
	    var s = document.createElement("div");
	    s.setAttribute("class",'spacer');
	    p[i].parentNode.insertBefore(s, p[i].nextSibling);
	    // latexonline
	    var r = document.createElement("button");
	    r.innerText=buttons["LaTeX Online"];
	    r.setAttribute("onclick",'latexcgi("pre' + i + '")');
	    r.setAttribute("id","lo-pre" + i);
	    p[i].parentNode.insertBefore(r, p[i].nextSibling);
	    // overleaf
	    var o = document.createElement("button");
	    o.innerText=buttons["Open in Overleaf"];
	    o.setAttribute("onclick",'openinoverleaf("pre' + i + '")');
	    p[i].parentNode.insertBefore(o, p[i].nextSibling);
	    var f=document.createElement("span");
	    // action=\"https://httpbin.org/post\"
	    // action=\"https://www.overleaf.com/docs\"
	    f.innerHTML="<form style=\"display:none\" id=\"form-pre" + i +"\" action=\"https://www.overleaf.com/docs\" method=\"post\" target=\"_blank\"></form>";
	    p[i].parentNode.insertBefore(f, p[i].nextSibling);
	    var f2=document.createElement("span");
	    // action=\"https://httpbin.org/post\"
	    // action=\"http://localhost/cgi-bin/p2-debug\"
	    // action=\"http://localhost/cgi-bin/p2\"
	    f2.innerHTML="<form style=\"display:none\" id=\"form2-pre" + i + "\" name=\"form2-pre" + i +"\" enctype=\"multipart/form-data\" action=\"https://latexcgi.xyz/cgi-bin/latexcgi\" method=\"post\" target=\"pre" + i + "ifr\"></form>";
	    p[i].parentNode.insertBefore(f2, p[i].nextSibling);
	}
	    editor = ace.edit(p[i]);
	    ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12') ;
	    editor.setTheme("ace/theme/textmate");
	    editor.getSession().setMode("ace/mode/latex");
	    editor.setOption("minLines",5);
	    editor.setOption("maxLines",100);
	    editor.resize();
	    editors["pre" + i]=editor;
	}
    }
}

const commentregex = / %.*/;
const engineregex = /% *!TEX.*[^a-zA-Z]((pdf|xe|lua|u?p)latex) *\n/i;
const returnregex = /% *!TEX.*[^a-zA-Z](pdfjs|pdf|log) *\n/i;
const makeindexregex = /% *!TEX.*[^a-zA-Z]makeindex( [a-z0-9\.\- ]*)\n/ig;

// https://www.overleaf.com/devs
function addinput(f,n,v) {
    var inp=document.createElement("input");
    inp.setAttribute("type","text");
    inp.setAttribute("name",n);
    inp.value =encodeURIComponent(v);
    f.appendChild(inp);
}

function addinputnoenc(f,n,v) {
    var inp=document.createElement("input");
    inp.setAttribute("type","text");
    inp.setAttribute("name",n);
    inp.value =v;
    f.appendChild(inp);
}

function addtextarea(f,n,v) {
    var inp=document.createElement("textarea");
    inp.setAttribute("type","text");
    inp.setAttribute("name",n);
    inp.textContent=v;
    f.appendChild(inp);
}

function openinoverleaf(nd) {
    var fm = document.getElementById('form-' + nd);
    fm.innerHTML="";
    var p = document.getElementById(nd);
//ace    var t = p.innerText;
    var t = editors[nd].getValue();
    addinput(fm,"encoded_snip[]",t.replace(engineregex,''));
    addinput(fm,"snip_name[]","document.tex");
    if(typeof(preincludes) == "object") {
	if(typeof(preincludes[nd]) == "object") {
	    var incl=preincludes[nd];
	    for(prop in incl) {
//ace		addinput(fm,"encoded_snip[]",document.getElementById(prop).innerText);
		addinput(fm,"encoded_snip[]",editors[prop].getValue());
		addinput(fm,"snip_name[]",incl[prop]);
	    }
	}
    }
    var engv="pdflatex";
    var eng=t.match(engineregex);
    if(eng != null) {
	engv=eng[1].toLowerCase();
	if(engv == "platex" || engv == "uplatex") {
	    addinput(fm,"encoded_snip[]","$latex = '" + engv + "';\n$bibtex = 'pbibtex';\n$dvipdf = 'dvipdfmx %O -o %D %S';");
	    addinput(fm,"snip_name[]","latexmkrc");
	    engv="latex_dvipdf";
	}
    } else if(t.indexOf("fontspec") !== -1) {
	engv="xelatex";
    }
    addinput(fm,"engine",engv);
    fm.submit();
}

// https://github.com/YtoTech/latex-on-http

function latexonhttpbutton(nd) {
    var jsn=[];
    if(typeof(preincludes) == "object") {
	if(typeof(preincludes[nd]) == "object") {
	    var incl=preincludes[nd];
	    for(prop in incl) {
		jsn.push({path: incl[prop],
			  content: document.getElementById(prop).innerText
			 })
	    }
	}
    }
    var p = document.getElementById(nd);
    var t = p.innerText;
    jsn.push({main: true, content: t});
    var b = document.getElementById('lo-' + nd);
    var ifr= document.getElementById(nd + "ifr");
    if(ifr == null) {
	ifr=document.createElement("iframe");
	ifr.setAttribute("width","100%");
	ifr.setAttribute("height","500em");
	ifr.setAttribute("id",nd + "ifr");
	ifr.setAttribute("name",nd + "ifr");
	p.parentNode.insertBefore(ifr, b.nextSibling);
	d=document.createElement("button");
	d.innerText=buttons["Delete Output"];
	d.setAttribute("id","del-" + nd);
	d.setAttribute("onclick",'deleteoutput("' + nd + '")');
	p.parentNode.insertBefore(d, b.nextSibling);
    }
    var cmd="pdflatex";
    var eng=t.match(engineregex);
    if(eng != null) {
	cmd=eng[1].toLowerCase();
    } else if(t.indexOf("fontspec") !== -1) {
	cmd="xelatex";
    }
    var fm = document.getElementById('form2-' + nd);
    fm.innerHTML="";
    addinputnoenc(fm,"compiler",cmd);
    addinputnoenc(fm,"resources",JSON.stringify(jsn));
    fm.submit();
//    alert(fm.getAttribute("target"));
//    alert(ifr.getAttribute("name"));

}


function latexonhttp(nd) {
    var jsn=[];
    if(typeof(preincludes) == "object") {
	if(typeof(preincludes[nd]) == "object") {
	    var incl=preincludes[nd];
	    for(prop in incl) {
		jsn.push({path: incl[prop],
			  content: document.getElementById(prop).innerText
			 })
	    }
	}
    }
    var p = document.getElementById(nd);
    var t = p.innerText;
    // no biber support currently
    if(t.indexOf("biblatex") !== -1) {
	t=t.replace(/usepackage\{biblatex/,'usepackage[]\{biblatex');
	t=t.replace(/\]\{biblatex/,',backend=bibtex]\{biblatex');
    }
    jsn.push({main: true, content: t});
    var b = document.getElementById('lo-' + nd);
    var ifr= document.getElementById(nd + "ifr");
    if(ifr == null) {
	ifr=document.createElement("iframe");
	ifr.setAttribute("width","100%");
	ifr.setAttribute("height","500em");
	ifr.setAttribute("id",nd + "ifr");
	ifr.setAttribute("name",nd + "ifr");
	p.parentNode.insertBefore(ifr, b.nextSibling);
	d=document.createElement("button");
	d.innerText=buttons["Delete Output"];
	d.setAttribute("id","del-" + nd);
	d.setAttribute("onclick",'deleteoutput("' + nd + '")');
	p.parentNode.insertBefore(d, b.nextSibling);
    }
    var cmd="pdflatex";
    var eng=t.match(engineregex);
    if(eng != null) {
	cmd=eng[1].toLowerCase();
    } else if(t.indexOf("fontspec") !== -1) {
	cmd="xelatex";
    }
    var fm = document.getElementById('form2-' + nd);
    fm.innerHTML="";
    addinputnoenc(fm,"compiler",cmd);
    addinputnoenc(fm,"resources",JSON.stringify(jsn));
    fm.submit();
}

//

function copytoclipboard(nd){
    var p = document.getElementById(nd);
    var nn=document.createElement("textarea");
    nn.value=p.innerText;
    document.body.appendChild(nn);
    nn.select();
    document.execCommand("copy");
    document.body.removeChild(nn);
}


function allowedit(nd){
    var p = document.getElementById(nd);
    p.contentEditable="true";
    p.setAttribute("spellcheck","false");
    p.innerHTML=p.innerText;
    p.style.border="solid thin green";
}

function deleteoutput(nd){
    var b = document.getElementById('del-' + nd);
    var ifr = document.getElementById(nd + 'ifr');
    b.parentNode.removeChild(b);
    ifr.parentNode.removeChild(ifr);
}

function latexcgi(nd) {
    var fm = document.getElementById('form2-' + nd);
    fm.innerHTML="";
    var p = document.getElementById(nd);
//ace    var t = p.innerText;
    var t = editors[nd].getValue();
    addtextarea(fm,"filecontents[]",t);
    addinputnoenc(fm,"filename[]","document.tex");
    if(typeof(preincludes) == "object") {
	if(typeof(preincludes[nd]) == "object") {
	    var incl=preincludes[nd];
	    for(prop in incl) {
//ace		addtextarea(fm,"filecontents[]",document.getElementById(prop).innerText);
		addtextarea(fm,"filecontents[]",editors[prop].getValue());
		addinputnoenc(fm,"filename[]",incl[prop]);
	    }
	}
    }
    var engv="pdflatex";
    var eng=t.match(engineregex);
    if(eng != null) {
	engv=eng[1].toLowerCase();
    } else if(t.indexOf("fontspec") !== -1) {
	engv="xelatex";
    }
    addinput(fm,"engine",engv);
    var rtn = t.match(returnregex);
    var rtnv = "";
    if(rtn == null) {
	// ES6 / IE
	if (typeof Symbol == "undefined") addinput(fm,"return","pdf");
    } else {
	rtnv=rtn[1].toLowerCase();
	addinput(fm,"return",rtnv);
    }
    var mki = makeindexregex.exec(t);
    while (mki != null) {
	addinputnoenc(fm,"makeindex[]",mki[1]);
	mki = makeindexregex.exec(t);
    }
    var b = document.getElementById('lo-' + nd);
    var ifr= document.getElementById(nd + "ifr");
    if(ifr == null) {
	ifr=document.createElement("iframe");
	ifr.setAttribute("width","100%");
	ifr.setAttribute("height","500em");
	ifr.setAttribute("id",nd + "ifr");
	ifr.setAttribute("name",nd + "ifr");
	p.parentNode.insertBefore(ifr, b.nextSibling);
	d=document.createElement("button");
	d.innerText=buttons["Delete Output"];
	d.setAttribute("id","del-" + nd);
	d.setAttribute("onclick",'deleteoutput("' + nd + '")');
	p.parentNode.insertBefore(d, b.nextSibling);
    }
    var  loading=document.createElement("div");
    loading.id=nd+"load";
    loading.textContent=buttons["Compiling PDF"] + " . . .";
    p.parentNode.insertBefore(loading, ifr);
    // scroll only if really close to the bottom
    var rect = b.getBoundingClientRect();
    if(document.documentElement.clientHeight - rect.bottom < 50){
	window.scrollBy(0,150);
    }
    setTimeout(function () {
	p.parentNode.removeChild(document.getElementById(nd+"load"));
    }, 1000);
    fm.submit();
}

window.addEventListener('load', llexamples, false);
