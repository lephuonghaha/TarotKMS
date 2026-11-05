const fs = require('fs');

let code = fs.readFileSync('src/utils/interpretationEngine.js', 'utf8');

code = code.replace(
    /-\s*Lá\s*1:\s*\$\{\s*\(c1\.data\s*\|\|\s*c1\)\.nameVi\s*\}\s*\(\s*\$?\{?\(?c1\.data\s*\|\|\s*c1\)?\.nameEn\}?\)\s*-\s*\$\{c1\.isReversed\s*\?\s*'Ngược'\s*:\s*'Xuôi'\}/g,
    "- Lá 1: ${(c1.data || c1).nameVi} (${(c1.data || c1).nameEn}) - ${c1.isReversed ? 'Ngược' : 'Xuôi'}"
);
code = code.replace(
    /-\s*Lá\s*2:\s*\$\{\s*\(c2\.data\s*\|\|\s*c2\)\.nameVi\s*\}\s*\(\s*\$?\{?\(?c2\.data\s*\|\|\s*c2\)?\.nameEn\}?\)\s*-\s*\$\{c2\.isReversed\s*\?\s*'Ngược'\s*:\s*'Xuôi'\}/g,
    "- Lá 2: ${(c2.data || c2).nameVi} (${(c2.data || c2).nameEn}) - ${c2.isReversed ? 'Ngược' : 'Xuôi'}"
);
code = code.replace(
    /-\s*Lá\s*3:\s*\$\{\s*\(c3\.data\s*\|\|\s*c3\)\.nameVi\s*\}\s*\(\s*\$?\{?\(?c3\.data\s*\|\|\s*c3\)?\.nameEn\}?\)\s*-\s*\$\{c3\.isReversed\s*\?\s*'Ngược'\s*:\s*'Xuôi'\}/g,
    "- Lá 3: ${(c3.data || c3).nameVi} (${(c3.data || c3).nameEn}) - ${c3.isReversed ? 'Ngược' : 'Xuôi'}"
);

// Also let's do a direct replacement of any (${c3.data || c3).nameEn})
code = code.split('(${c1.data || c1).nameEn})').join('(${(c1.data || c1).nameEn})');
code = code.split('(${c2.data || c2).nameEn})').join('(${(c2.data || c2).nameEn})');
code = code.split('(${c3.data || c3).nameEn})').join('(${(c3.data || c3).nameEn})');

fs.writeFileSync('src/utils/interpretationEngine.js', code, 'utf8');
console.log('Fixed all card name formatting lines.');
