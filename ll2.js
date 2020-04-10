function llexamples() {
    var p = document.getElementsByTagName("pre");
    for(var i=0;i<p.length;i++) {
    if(p[i].textContent.indexOf("\\documentclass") !== -1) {
	p[i].setAttribute("id","pre" + i);
	// edit
	var b = document.createElement("button");
	b.innerText="edit";
	b.setAttribute("onclick",'allowedit("pre' + i + '")');
	p[i].parentNode.insertBefore(b, p[i]);
	// copy
	var c = document.createElement("button");
	c.innerText="copy";
	c.setAttribute("onclick",'copytoclipboard("pre' + i + '")');
	p[i].parentNode.insertBefore(c, p[i]);
	// latexonline
	var r = document.createElement("button");
	r.innerText="LaTeX online";
	r.setAttribute("onclick",'latexonlinecc("pre' + i + '")');
	r.setAttribute("id","lo-pre" + i);
	p[i].parentNode.insertBefore(r, p[i].nextSibling);
	// overleaf
	var o = document.createElement("button");
	o.innerText="Open!1 in OverLeaf";
	o.setAttribute("onclick",'openinoverleaf("pre' + i + '")');
	p[i].parentNode.insertBefore(o, p[i].nextSibling);
	var f=document.createElement("span");
	f.innerHTML="<form style=\"display:none\" id=\"form-pre" + i +"\" action=\"https://www.overleaf.com/docs\" method=\"post\" target=\"_blank\"><input id=\"encoded_snip-pre" + i + "\" name=\"encoded_snip[]\" value=\"\" /><input id=\"encoded_snip-pre" + i + "b\" name=\"snip_uri[]\" value=\"data:,test\" /></form>";
	p[i].parentNode.insertBefore(f, p[i].nextSibling);
    }
    }
}

function latexonlinecc(nd) {
    var p = document.getElementById(nd);
    var b = document.getElementById('lo-' + nd);
    var ifr= document.getElementById(nd + "ifr");
    if(ifr == null) {
	ifr=document.createElement("iframe");
	ifr.setAttribute("width","100%");
	ifr.setAttribute("height","500em");
	ifr.setAttribute("id",nd + "ifr");
	p.parentNode.insertBefore(ifr, b.nextSibling);
	d=document.createElement("button");
	d.innerText="Delete Output";
	d.setAttribute("id","del-" + nd);
	d.setAttribute("onclick",'deleteoutput("' + nd + '")');
	p.parentNode.insertBefore(d, b.nextSibling);
    }
    ifr.setAttribute("src","https://latexonline.cc/compile?text=" + encodeURIComponent(p.innerText));
}


// based on code from texnique.fr
function openinoverleaf(nd) {
  var p = document.getElementById(nd);
  document.getElementById('encoded_snip-' + nd ).value =encodeURIComponent(p.innerText);
  document.getElementById('form-' + nd).submit();
}


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


window.addEventListener('load', llexamples, false);
