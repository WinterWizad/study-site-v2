$content = Get-Content "C:\Users\prajw\OneDrive\Desktop\8th sem bim exam\study-site-v2\dist\bi\model-question-answers.html" -Raw

# Fix missing closing </details> tags before <hr class="custom-hr">
$content = $content -replace "(</p>\s*<hr class=`"custom-hr`">)", "</p></details>`$1"
$content = $content -replace "(</ol>\s*<hr class=`"custom-hr`">)", "</ol></details>`$1"
$content = $content -replace "(</div>\s*<hr class=`"custom-hr`">)", "</div></details>`$1"
$content = $content -replace "(</table>\s*<hr class=`"custom-hr`">)", "</table></details>`$1"
$content = $content -replace "(</pre>\s*<hr class=`"custom-hr`">)", "</pre></details>`$1"
$content = $content -replace "(</code>\s*<hr class=`"custom-hr`">)", "</code></details>`$1"

# Also fix the last question (D22) which ends before </main>
$content = $content -replace "(</tbody></table></div><p><strong>Three things)", "</details>`$1"
$content = $content -replace "(</p>\s*</main>)", "</p></details></main>"

Set-Content "C:\Users\prajw\OneDrive\Desktop\8th sem bim exam\study-site-v2\dist\bi\model-question-answers.html" -Value $content -Encoding UTF8
