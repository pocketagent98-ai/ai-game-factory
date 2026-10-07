#!/usr/bin/env python3
# ---------------------------------------------------------------------------
# Merge & Bloom — Playgama cover art (original vector art, rendered by CairoSVG)
#
# No generative model is used or available here: this is hand-authored vector
# geometry (gradients, paths, glow filters) written in code and rasterised to
# the exact pixel sizes Playgama requires. One master scene, three crops, so
# the square / portrait / landscape covers are unmistakably the same game.
#
# Composition follows the brief: the MERGE moment is the foreground hero; the
# World Tree (highest progression tier) stands in the background; garden plots,
# flowers, coins and sparkles fill the scene. No text, no watermark.
# Palette is taken from the game's own config (meadow theme + tier colours).
# ---------------------------------------------------------------------------
import cairosvg, math

# --- palette (vibrant, high-contrast for thumbnail legibility) --------------
SKY1, SKY2, SKY3 = "#1c7358", "#0f4a38", "#08301f"
SUN = "#ffe0a3"
MINT = "#7ef0b0"
GOLD = "#ffd54f"
PINK = "#ff5fa2"
PURPLE = "#b06cff"
ORANGE = "#ff7a3d"
CYAN = "#4dd0e1"
LIME = "#9ee34f"
LEAF_F = "#2f8a5f"      # foreground leaf green
LEAF_D = "#123a2a"      # dark foreground leaf
TRUNK1, TRUNK2, TRUNK3 = "#8a5a2b", "#6b4423", "#3f2712"


def leaf(cx, cy, ln, wd, rot, fill, vein="#3f7a52"):
    return (f'<g transform="translate({cx:.1f},{cy:.1f}) rotate({rot})">'
            f'<path d="M0 0 C {wd} {-ln*0.36}, {wd} {-ln*0.72}, 0 {-ln} '
            f'C {-wd} {-ln*0.72}, {-wd} {-ln*0.36}, 0 0 Z" fill="{fill}"/>'
            f'<path d="M0 0 L 0 {-ln}" stroke="{vein}" stroke-width="{max(1.4, ln*0.045):.1f}" '
            f'stroke-linecap="round" fill="none"/></g>')


def flower(cx, cy, r, col, petals=6, core=GOLD):
    out = [f'<g transform="translate({cx:.1f},{cy:.1f})">']
    for i in range(petals):
        a = i * (360.0 / petals)
        out.append(f'<ellipse cx="0" cy="{-r*0.64:.1f}" rx="{r*0.36:.1f}" ry="{r*0.64:.1f}" '
                   f'fill="{col}" transform="rotate({a:.1f})"/>')
    out.append(f'<circle cx="0" cy="0" r="{r*0.36:.1f}" fill="{core}"/>')
    out.append('</g>')
    return "".join(out)


def sprout(cx, cy, s, c1=LIME, c2="#6fbf3a"):
    # a small plant: stem + two leaves (the merge pair uses two identical ones)
    return "".join([
        f'<path d="M {cx:.1f} {cy:.1f} L {cx:.1f} {cy-s*0.92:.1f}" stroke="#2e7d32" '
        f'stroke-width="{s*0.15:.1f}" stroke-linecap="round"/>',
        leaf(cx, cy - s * 0.56, s * 0.64, s * 0.31, -34, c1),
        leaf(cx, cy - s * 0.78, s * 0.64, s * 0.31, 34, c2),
    ])


def coin(cx, cy, r):
    return (f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{GOLD}" stroke="#c9901a" '
            f'stroke-width="{max(1.4, r*0.16):.1f}"/>'
            f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r*0.5:.1f}" fill="none" stroke="#c9901a" '
            f'stroke-width="{max(1, r*0.1):.1f}"/>')


def star(x, y, r, col, op=1.0):
    return (f'<path d="M {x:.1f} {y-r:.1f} L {x+r*0.28:.1f} {y-r*0.28:.1f} L {x+r:.1f} {y:.1f} '
            f'L {x+r*0.28:.1f} {y+r*0.28:.1f} L {x:.1f} {y+r:.1f} L {x-r*0.28:.1f} {y+r*0.28:.1f} '
            f'L {x-r:.1f} {y:.1f} L {x-r*0.28:.1f} {y-r*0.28:.1f} Z" fill="{col}" opacity="{op}"/>')


def scene(W, H):
    S = min(W, H)
    cx = W / 2
    ground = 0.84 * H
    canopy_cy = 0.27 * H
    canopy_r = 0.23 * S
    mcx, mcy = W / 2, 0.63 * H
    ms = 0.19 * S
    p = []
    a = p.append
    a(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">')
    # ---------------- defs ----------------
    a('<defs>')
    a(f'<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">'
      f'<stop offset="0" stop-color="{SKY1}"/><stop offset="52%" stop-color="{SKY2}"/>'
      f'<stop offset="100%" stop-color="{SKY3}"/></linearGradient>')
    a(f'<radialGradient id="sun" cx="50%" cy="50%" r="50%">'
      f'<stop offset="0" stop-color="{SUN}" stop-opacity="0.85"/>'
      f'<stop offset="55%" stop-color="{MINT}" stop-opacity="0.30"/>'
      f'<stop offset="100%" stop-color="{MINT}" stop-opacity="0"/></radialGradient>')
    a(f'<radialGradient id="glow" cx="50%" cy="50%" r="50%">'
      f'<stop offset="0" stop-color="{MINT}" stop-opacity="0.7"/>'
      f'<stop offset="100%" stop-color="{MINT}" stop-opacity="0"/></radialGradient>')
    a(f'<radialGradient id="flash" cx="50%" cy="50%" r="50%">'
      f'<stop offset="0" stop-color="#ffffff" stop-opacity="1"/>'
      f'<stop offset="38%" stop-color="{GOLD}" stop-opacity="0.85"/>'
      f'<stop offset="100%" stop-color="{GOLD}" stop-opacity="0"/></radialGradient>')
    a(f'<linearGradient id="trunk" x1="0" y1="0" x2="1" y2="0">'
      f'<stop offset="0" stop-color="{TRUNK3}"/><stop offset="0.42" stop-color="{TRUNK1}"/>'
      f'<stop offset="0.62" stop-color="{TRUNK2}"/><stop offset="1" stop-color="{TRUNK3}"/></linearGradient>')
    a(f'<linearGradient id="canopy" x1="0.2" y1="0" x2="0.8" y2="1">'
      f'<stop offset="0" stop-color="#8ff0cd"/><stop offset="45%" stop-color="#2fbf9f"/>'
      f'<stop offset="100%" stop-color="#0d6350"/></linearGradient>')
    a(f'<linearGradient id="soil" x1="0" y1="0" x2="0" y2="1">'
      f'<stop offset="0" stop-color="#3d6f50"/><stop offset="100%" stop-color="#163726"/></linearGradient>')
    a(f'<radialGradient id="vig" cx="50%" cy="46%" r="74%">'
      f'<stop offset="55%" stop-color="#000" stop-opacity="0"/>'
      f'<stop offset="100%" stop-color="#03110b" stop-opacity="0.6"/></radialGradient>')
    a(f'<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">'
      f'<stop offset="0" stop-color="{SKY2}" stop-opacity="0"/>'
      f'<stop offset="50%" stop-color="{SKY2}" stop-opacity="0.22"/>'
      f'<stop offset="100%" stop-color="{SKY2}" stop-opacity="0"/>'
      f'</linearGradient>')
    a(f'<filter id="blur" x="-60%" y="-60%" width="220%" height="220%">'
      f'<feGaussianBlur stdDeviation="{max(8, S*0.03):.1f}"/></filter>')
    a(f'<filter id="blur2" x="-60%" y="-60%" width="220%" height="220%">'
      f'<feGaussianBlur stdDeviation="{max(4, S*0.012):.1f}"/></filter>')
    a('</defs>')
    # ---------------- sky ----------------
    a(f'<rect width="{W}" height="{H}" fill="url(#sky)"/>')
    a(f'<circle cx="{cx}" cy="{canopy_cy}" r="{0.46*S}" fill="url(#sun)"/>')
    # ---------------- distant hills ----------------
    a(f'<path d="M0 {0.80*H} Q {0.26*W} {0.70*H} {0.52*W} {0.79*H} T {W} {0.75*H} '
      f'L {W} {H} L 0 {H} Z" fill="#0e3f2e" opacity="0.9"/>')
    a(f'<path d="M0 {0.855*H} Q {0.32*W} {0.78*H} {0.64*W} {0.845*H} T {W} {0.83*H} '
      f'L {W} {H} L 0 {H} Z" fill="#0a3020" opacity="0.95"/>')
    # ---------------- World Tree (background) ----------------
    tw = 0.052 * S
    base_y = ground + 0.055 * H
    a(f'<circle cx="{cx}" cy="{canopy_cy}" r="{canopy_r*1.25}" fill="url(#glow)" filter="url(#blur)"/>')
    for sgn in (-1, 1):
        a(f'<path d="M {cx+sgn*tw*0.9:.1f} {base_y:.1f} q {sgn*tw*1.5:.1f} {0.014*H:.1f} '
          f'{sgn*tw*2.8:.1f} {0.007*H:.1f}" stroke="url(#trunk)" stroke-width="{tw*0.62:.1f}" '
          f'fill="none" stroke-linecap="round"/>')
    a(f'<path d="M {cx-tw*0.5:.1f} {canopy_cy+canopy_r*0.45:.1f} '
      f'C {cx-tw*0.9:.1f} {canopy_cy+canopy_r*1.1:.1f}, {cx-tw*1.2:.1f} {base_y*0.7:.1f}, '
      f'{cx-tw*1.3:.1f} {base_y:.1f} L {cx+tw*1.3:.1f} {base_y:.1f} '
      f'C {cx+tw*1.2:.1f} {base_y*0.7:.1f}, {cx+tw*0.9:.1f} {canopy_cy+canopy_r*1.1:.1f}, '
      f'{cx+tw*0.5:.1f} {canopy_cy+canopy_r*0.45:.1f} Z" fill="url(#trunk)"/>')
    a(f'<path d="M {cx-tw*0.12:.1f} {canopy_cy+canopy_r*0.7:.1f} L {cx-tw*0.22:.1f} {base_y*0.99:.1f}" '
      f'stroke="{TRUNK3}" stroke-width="{tw*0.15:.1f}" opacity="0.45"/>')
    for sgn in (-1, 1):
        a(f'<path d="M {cx:.1f} {canopy_cy+canopy_r*0.95:.1f} q {sgn*tw*2.0:.1f} {-canopy_r*0.12:.1f} '
          f'{sgn*tw*3.4:.1f} {-canopy_r*0.44:.1f}" stroke="url(#trunk)" stroke-width="{tw*0.5:.1f}" '
          f'fill="none" stroke-linecap="round"/>')
    for dx, dy, r in [(-0.60, 0.08, 0.56), (0.60, 0.08, 0.56), (0, -0.44, 0.60),
                      (-0.34, -0.12, 0.54), (0.34, -0.12, 0.54), (-0.20, 0.30, 0.42), (0.20, 0.30, 0.42)]:
        a(f'<circle cx="{cx+dx*canopy_r:.1f}" cy="{canopy_cy+dy*canopy_r:.1f}" '
          f'r="{r*canopy_r:.1f}" fill="url(#canopy)"/>')
    # rim light on the canopy (top-left)
    a(f'<circle cx="{cx-0.24*canopy_r:.1f}" cy="{canopy_cy-0.40*canopy_r:.1f}" '
      f'r="{0.30*canopy_r:.1f}" fill="#c7ffe8" opacity="0.5" filter="url(#blur2)"/>')
    for dx, dy in [(-0.48, 0.22), (0.46, 0.08), (-0.10, -0.32), (0.24, 0.34), (-0.34, -0.20), (0.52, 0.34)]:
        fx, fy = cx + dx * canopy_r, canopy_cy + dy * canopy_r
        a(f'<path d="M {fx:.1f} {fy-0.09*canopy_r:.1f} L {fx:.1f} {fy:.1f}" stroke="#0d6350" '
          f'stroke-width="{max(1.4, S*0.004):.1f}"/>')
        a(f'<circle cx="{fx:.1f}" cy="{fy:.1f}" r="{0.052*canopy_r:.1f}" fill="{GOLD}"/>')
    # haze over the background (depth)
    a(f'<rect x="0" y="{0.16*H}" width="{W}" height="{0.48*H}" fill="url(#haze)"/>')
    # ---------------- soil + garden plots ----------------
    a(f'<rect x="0" y="{ground}" width="{W}" height="{H-ground}" fill="url(#soil)"/>')
    pw = 0.13 * W
    gapc = 0.30 * W
    span = (W - gapc - 2 * pw) / 3.0
    xs = [gapc/2, gapc/2 + pw + span, W - gapc/2 - pw - span, W - gapc/2 - pw]
    plot_tiers = [1, 2, 3, 4]
    for i, px in enumerate(xs):
        a(f'<rect x="{px:.1f}" y="{ground+0.018*H:.1f}" width="{pw:.1f}" height="{0.045*H:.1f}" '
          f'rx="{0.013*H:.1f}" fill="#0f3223" stroke="#2f6b4d" stroke-width="{max(2, S*0.004):.1f}"/>')
        a(sprout(px + pw/2, ground + 0.014*H, 0.055*S,
                 c1=[LIME, "#8fd94a", MINT, "#7fd9c0"][i], c2=["#6fbf3a", "#5fb84a", "#5fc9a8", "#4fb8d0"][i]))
    # ---------------- mid-ground bushes ----------------
    for bx, by, r in [(0.07, 0.74, 0.055), (0.20, 0.79, 0.045), (0.80, 0.79, 0.045), (0.93, 0.74, 0.055)]:
        X, Y, R = bx*W, by*H, r*S
        a(f'<circle cx="{X:.1f}" cy="{Y:.1f}" r="{R:.1f}" fill="#24624a"/>')
        a(f'<circle cx="{X-R*0.55:.1f}" cy="{Y+R*0.15:.1f}" r="{R*0.7:.1f}" fill="#2f7d5c"/>')
        a(f'<circle cx="{X+R*0.55:.1f}" cy="{Y+R*0.2:.1f}" r="{R*0.66:.1f}" fill="#24624a"/>')
    # ---------------- MERGE MOMENT (foreground hero) ----------------
    a(f'<ellipse cx="{mcx:.1f}" cy="{mcy+ms*0.95:.1f}" rx="{ms*2.4:.1f}" ry="{ms*0.32:.1f}" '
      f'fill="#03110b" opacity="0.45" filter="url(#blur2)"/>')
    a(f'<circle cx="{mcx}" cy="{mcy-ms*0.55}" r="{ms*2.0}" fill="url(#glow)" filter="url(#blur)"/>')
    lx, rx = mcx - ms * 1.30, mcx + ms * 1.30
    baseY = mcy + ms * 0.78
    a(sprout(lx, baseY, ms * 0.82))
    a(sprout(rx, baseY, ms * 0.82))
    # burst
    a(f'<circle cx="{mcx}" cy="{mcy-ms*0.62}" r="{ms*0.92}" fill="url(#flash)"/>')
    a(f'<circle cx="{mcx}" cy="{mcy-ms*0.62}" r="{ms*0.68}" fill="none" stroke="{GOLD}" '
      f'stroke-width="{ms*0.055:.1f}" opacity="0.95"/>')
    a(f'<circle cx="{mcx}" cy="{mcy-ms*0.62}" r="{ms*0.88}" fill="none" stroke="{MINT}" '
      f'stroke-width="{ms*0.03:.1f}" opacity="0.7"/>')
    for i in range(16):
        ang = math.radians(i * (360/16) + 11)
        d = ms * (0.55 + 0.55 * ((i % 3) / 2))
        px, py = mcx + math.cos(ang) * d, (mcy - ms * 0.62) + math.sin(ang) * d
        rr = ms * (0.06 if i % 2 else 0.038)
        a(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="{rr:.1f}" fill="{GOLD if i % 3 else CYAN}" opacity="0.95"/>')
    # the upgraded bloom rising out of the burst
    a(f'<path d="M {mcx:.1f} {mcy-ms*0.20:.1f} L {mcx:.1f} {mcy-ms*0.88:.1f}" stroke="#2e7d32" '
      f'stroke-width="{ms*0.11:.1f}" stroke-linecap="round"/>')
    a(leaf(mcx, mcy - ms * 0.55, ms * 0.52, ms * 0.25, -42, LIME))
    a(leaf(mcx, mcy - ms * 0.70, ms * 0.52, ms * 0.25, 42, "#6fbf3a"))
    # energy column rising from the burst into the bloom (makes the "result" read as emerging)
    a(f'<path d="M {mcx-ms*0.26:.1f} {mcy-ms*0.55:.1f} L {mcx-ms*0.12:.1f} {mcy-ms*1.05:.1f} '
      f'L {mcx+ms*0.12:.1f} {mcy-ms*1.05:.1f} L {mcx+ms*0.26:.1f} {mcy-ms*0.55:.1f} Z" '
      f'fill="{MINT}" opacity="0.35" filter="url(#blur2)"/>')
    a(f'<circle cx="{mcx}" cy="{mcy-ms*1.06:.1f}" r="{ms*0.74:.1f}" fill="{GOLD}" opacity="0.5" filter="url(#blur2)"/>')
    a(flower(mcx, mcy - ms * 1.06, ms * 0.62, PINK))
    # beams + arrowheads drawn last so nothing covers them
    for sgn in (-1, 1):
        sx, sy = mcx + sgn * ms * 1.30, baseY - ms * 0.72
        ex, ey = mcx + sgn * ms * 0.78, mcy - ms * 0.62
        a(f'<line x1="{sx:.1f}" y1="{sy:.1f}" x2="{ex:.1f}" y2="{ey:.1f}" stroke="{MINT}" '
          f'stroke-width="{ms*0.08:.1f}" stroke-linecap="round" opacity="0.95"/>')
        dx, dy = ex - sx, ey - sy
        L = math.hypot(dx, dy) or 1
        ux, uy = dx / L, dy / L
        px, py = -uy, ux
        bcx, bcy = ex - ux * ms * 0.32, ey - uy * ms * 0.32
        a(f'<path d="M {ex:.1f} {ey:.1f} L {bcx+px*ms*0.18:.1f} {bcy+py*ms*0.18:.1f} '
          f'L {bcx-px*ms*0.18:.1f} {bcy-py*ms*0.18:.1f} Z" fill="{MINT}"/>')
    # coins rising from the merge
    for dx, dy in [(-1.75, 0.05), (1.72, 0.10), (1.98, 0.24)]:
        a(coin(mcx + dx * ms, baseY + dy * ms, ms * 0.15))
    # ---------------- sparkles / bokeh ----------------
    for fx, fy, col in [(0.16, 0.30, CYAN), (0.84, 0.26, GOLD), (0.24, 0.52, MINT),
                        (0.78, 0.50, PINK), (0.50, 0.18, GOLD), (0.10, 0.60, CYAN),
                        (0.90, 0.60, MINT), (0.62, 0.36, GOLD), (0.38, 0.42, CYAN),
                        (0.70, 0.66, PURPLE), (0.30, 0.68, ORANGE)]:
        a(star(fx * W, fy * H, 0.014 * S, col, 0.85))
    # ---------------- foreground flowers + leaf frame ----------------
    for fx, fy, col in [(0.13, 0.905, PURPLE), (0.30, 0.93, PINK), (0.70, 0.92, ORANGE), (0.88, 0.94, PINK)]:
        a(flower(fx * W, fy * H, 0.024 * S, col, 5))
    big = 0.34 * S
    for bx, by, rot, sc, col in [(0.01*W, H*1.0, -30, 1.05, LEAF_D), (0.15*W, H*1.02, -10, 0.85, "#1b4c36"),
                                 (0.99*W, H*1.0, 30, 1.05, LEAF_D), (0.85*W, H*1.02, 10, 0.85, "#1b4c36"),
                                 (0.31*W, H*1.03, -16, 0.62, "#215a41"), (0.69*W, H*1.03, 16, 0.62, "#215a41")]:
        a(leaf(bx, by, big * sc, big * sc * 0.4, rot, col, "#2f7355"))
    for sgn in (-1, 1):
        vx = cx + sgn * 0.42 * W
        for k in range(4):
            a(leaf(vx, 0.24 * H + k * 0.15 * H, 0.14 * S, 0.066 * S,
                   sgn * (62 - k * 12), "#1b4c36", "#2f7355"))
    # ---------------- vignette ----------------
    a(f'<rect width="{W}" height="{H}" fill="url(#vig)"/>')
    a('</svg>')
    return "\n".join(p)


if __name__ == "__main__":
    out = "/scratch/work/release/playgama/assets"
    for name, W, H in [("merge-bloom-square-800x800", 800, 800),
                       ("merge-bloom-portrait-1080x1920", 1080, 1920),
                       ("merge-bloom-landscape-1920x1080", 1920, 1080)]:
        svg = scene(W, H)
        open(f"{out}/{name}.svg", "w").write(svg)
        cairosvg.svg2png(bytestring=svg.encode(), write_to=f"{out}/{name}.png",
                         output_width=W, output_height=H)
        print("wrote", name, W, H)
