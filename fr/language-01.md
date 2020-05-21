---
title: "babel Français"
---

## hyphenation

LaTeX was written for use with English, and so there are very few
langauge-specific issues facing authors in English. The main one
is hyphenation: UK and US traditions are different. LaTeX starts out
using US English patterns, but you can switch to UK ones using `babel`.

```latex
\documentclass{article}
\usepackage[french]{babel}
\begin{document}
Du texte
\end{document}
```
