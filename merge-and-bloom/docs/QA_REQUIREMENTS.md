# QA_REQUIREMENTS — definition of done

A build is acceptable only when **all** of these pass.

## Automated
- [ ] `node test.mjs` → **all tests pass**
- [ ] `node --check js/config.js js/model.js js/platform.js js/game.js` → clean
- [ ] No secrets committed (grep for key patterns returns nothing)

## Manual / runtime
- [ ] Page loads with **no console errors**
- [ ] First merge reachable in **<15 s**
- [ ] Tap Seed Pod spawns a plant and costs 1 energy
- [ ] Drag-merge of two identical tiers produces the next tier
- [ ] A visitor order can be completed and pays coins
- [ ] Bloom Meter fills; a new Garden plot unlocks
- [ ] Plant → offline earnings accrue and are capped
- [ ] Each upgrade purchasable when coins suffice; blocked otherwise
- [ ] Save persists across reload; welcome-back shows offline earnings
- [ ] Board-rest panel appears when the board is full with no merges
- [ ] Rewarded flows grant rewards and respect daily caps
- [ ] Game is fully playable **with an ad-blocker** and **without** watching any ad
- [ ] Portrait phone viewport (390×844) looks correct; controls are ≥44 px
- [ ] Runs at ~60 fps on a mid-range Android

## Content
- [ ] All-ages, wholesome; no IP infringement; no watermarks
- [ ] All assets bundled (no external requests)
