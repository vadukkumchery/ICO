rsync -r src/ docs/
rsync -r build/contracts/* docs/
git add .
git commit -m " compiled pages for github pages"
git push -u origin master
