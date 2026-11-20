$content = Get-Content "C:\Users\prajw\OneDrive\Desktop\8th sem bim exam\study-site-v2\dist\bi\model-question-answers.html" -Raw

$startMarker = "<div class=`"markdown-body`">"
$endMarker = "</main>"

$startIdx = $content.IndexOf($startMarker)
if ($startIdx -ge 0) {
    $startIdx += $startMarker.Length
    $endIdx = $content.IndexOf($endMarker, $startIdx)
    if ($endIdx -ge 0) {
        $before = $content.Substring(0, $startIdx)
        $middle = $content.Substring($startIdx, $endIdx - $startIdx)
        $after = $content.Substring($endIdx)
        
        # Match ONLY h3 tags with question IDs that START with the prefix
        # Pattern: <h3 id="a1-define-...">A1. Define Business Intelligence (BI).</h3>
        # Groups: 1=full opening tag, 2=id prefix, 3=question text, 4=</h3>
        $middle = $middle -replace "(<h3 id=`"(a1-|a2-|a3-|a4-|a5-|a6-|a7-|a8-|a9-|a10-|b11-|b12-|b13-|b14-|b15-|b16-|c17-|c18-|c19-|c20-|d21-|d22-)[^`"]*`"[^>]*>)([^<]+)(</h3>)", "<details><summary>`$3</summary>"
        $middle = $middle -replace "(</h3>\s*<p>)", "</summary><p>"
        $middle = $middle -replace "(</h3>\s*<ol>)", "</summary><ol>"
        $middle = $middle -replace "(</h3>\s*<div>)", "</summary><div>"
        $middle = $middle -replace "(</p>\s*<hr>)", "</p></details><hr>"
        $middle = $middle -replace "(</p>\s*</div>)", "</p></details></div>"
        $middle = $middle -replace "(</ol>\s*<hr>)", "</ol></details><hr>"
        $middle = $middle -replace "(</div>\s*<hr>)", "</div></details><hr>"
        
        $content = $before + $middle + $after
    }
}

Set-Content "C:\Users\prajw\OneDrive\Desktop\8th sem bim exam\study-site-v2\dist\bi\model-question-answers.html" -Value $content -Encoding UTF8
