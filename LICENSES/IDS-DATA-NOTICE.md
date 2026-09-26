# IDS data attribution
The character-structure subset in `src/ids-data.ts` is adapted from the CJKVI IDS `ids.txt` dataset, blob SHA `de48f8bc6300fcc41f1888424383139ea0935e55`:
- Upstream: https://github.com/cjkvi/cjkvi-ids/blob/master/ids.txt
- CJKVI IDS README: https://github.com/cjkvi/cjkvi-ids/blob/master/README.md
- The upstream README states that `ids.txt` is derived from the CHISE project and follows its terms. CHISE IDS is distributed under GNU GPL version 2 or (at your option) any later version.
- CHISE IDS project and license statement: https://github.com/chise/ids/blob/main/README.md#license
- A copy of GPL-2.0-or-later is provided in this directory.
This app uses a filtered, normalized subset for the 497 distinct Han characters found in the 443 distinct vocabulary entries currently shown by the app (432 entries contain only Han characters; the remaining entries include punctuation or Latin notation). Region-tagged alternatives are selected for simplified Chinese where available. The displayed structure of 化 is normalized from the source glyph component 𠤎 to the familiar form 匕 for learners. IDS describes graphic composition; it is not a claim about historical etymology or a guarantee that a component contributes its modern standalone meaning.
