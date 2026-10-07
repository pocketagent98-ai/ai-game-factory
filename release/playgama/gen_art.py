#!/usr/bin/env python3
# Original vector key art for "Merge & Bloom" -> three Playgama cover crops.
# ONE master scene (same primitives, same palette) laid out responsively so the
# square / portrait / landscape covers are unmistakably the same game.
# No generative model is used; this is hand-authored SVG rendered with CairoSVG.
# Palette is taken from the game's own config (meadow theme + tier colours).
import cairosvg, math

BG1, BG2 = "#0f3d2e", "#124b39"
ACCENT   = "#7ef0b0"
GOLD     = "#ffd54f"
PINK     = "#f06292"
PURPLE   = "#ba68c8"
ORANGE   = "#ff7043"
TEAL     = "#26a69a"
CYAN     = "#4dd0e1"
LEAF1, LEAF2, LEAFD = "#7cb342", "#8bc34a", "#1f5138"


def leaf(cx, cy, ln, wd, rot, fill, vein="#5da02f"):
    return (f'<g transform="translate({cx:.1f},{cy:.1f}) rotate({rot})">'
            f'<path d="M0 0 C {wd} {-ln*0.35}, {wd} {-ln*0.7}, 0 {-ln} '
            f'C {-wd} {-ln*0.7}, {-wd} {-ln*0.35}, 0 0 Z" fill="{fill}"/>'
            f'<path d="M0 0 L 0 {-ln}" stroke="{vein}" stroke-width="{max(1.5,ln*0.05):.1f}" '
            f'stroke-linecap="round" fill="none"/></g>')


def flower(cx, cy, r, col, petals=6):
    p = [f'<g transform="translate({cx:.1f},{cy:.1f})">']
    for i in range(petals):
        a = i * (360 / petals)
        p.append(f'<ellipse cx="0" cy="{-r*0.62:.1f}" rx="{r*0.34:.1f}" ry="{r*0.62:.1f}" '
                 f'fill="{col}" transform="rotate({a})"/>')
    p.append(f'<circle cx="0" cy="0" r="{r*0.34:.1f}" fill="{GOLD}"/>')
    p.append('</g>')
    return "".join(p)


def sprout(cx, cy, s, col1=LEAF1, col2=LEAF2):
    # a small matching plant: short stem + two leaves (identical for the merge pair)
    return ("".join([
        f'<path d="M {cx:.1f} {cy:.1f} L {cx:.1f} {cy-s*0.9:.1f}" stroke="#2e7d32" '
        f'stroke-width="{s*0.14:.1f}" stroke-linecap="round"/>',
        leaf(cx, cy - s * 0.55, s * 0.62, s * 0.30, -34, col1),
        leaf(cx, cy - s * 0.75, s * 0.62, s * 0.30, 34, col2),
    ]))


def star(x, y, r, col, op=1.0):
    return (f'<path d="M {x:.1f} {y-r:.1f} L {x+r*0.28:.1f} {y-r*0.28:.1f} L {x+r:.1f} {y:.1f} '
            f'L {x+r*0.28:.1f} {y+r*0.28:.1f} L {x:.1f} {y+r:.1f} L {x-r*0.28:.1f} {y+r*0.28:.1f} '
            f'L {x-r:.1f} {y:.1f} L {x-r*0.28:.1f} {y-r*0.28:.1f} Z" fill="{col}" opacity="{op}"/>')


def coin(cx, cy, r):
    return (f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{GOLD}" stroke="#c99a1f" '
            f'stroke-width="{max(1.5,r*0.16):.1f}"/>'
            f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r*0.52:.1f}" fill="none" stroke="#c99a1f" '
            f'stroke-width="{max(1,r*0.1):.1f}"/>')


def scene(W, H):
    S = min(W, H)
    cx = W / 2
    ground = 0.86 * H
    canopy_cy = 0.19 * H
    canopy_r = 0.24 * S
    mcx, mcy = cx + 0.27 * S, 0.77 * H
    ms = 0.14 * S
    p = []
    a = p.append
    a(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">')
    # ---------------- defs ----------------
    a('<defs>')
    a(f'<radialGradient id="sky" cx="50%" cy="20%" r="100%">'
      f'<stop offset="0" stop-color="#2f8a68"/><stop offset="48%" stop-color="{BG2}"/>'
      f'<stop offset="100%" stop-color="{BG1}"/></radialGradient>')
    a(f'<radialGradient id="glow" cx="50%" cy="50%" r="50%">'
      f'<stop offset="0" stop-color="{ACCENT}" stop-opacity="0.55"/>'
      f'<stop offset="100%" stop-color="{ACCENT}" stop-opacity="0"/></radialGradient>')
    a(f'<radialGradient id="flash" cx="50%" cy="50%" r="50%">'
      f'<stop offset="0" stop-color="#ffffff" stop-opacity="1"/>'
      f'<stop offset="40%" stop-color="{GOLD}" stop-opacity="0.75"/>'
      f'<stop offset="100%" stop-color="{GOLD}" stop-opacity="0"/></radialGradient>')
    a(f'<linearGradient id="trunk" x1="0" y1="0" x2="1" y2="0">'
      f'<stop offset="0" stop-color="#5b3a1e"/><stop offset="0.5" stop-color="#83552b"/>'
      f'<stop offset="1" stop-color="#4a2f16"/></linearGradient>')
    a(f'<linearGradient id="canopy" x1="0" y1="0" x2="0" y2="1">'
      f'<stop offset="0" stop-color="#7fe6c4"/><stop offset="55%" stop-color="{TEAL}"/>'
      f'<stop offset="100%" stop-color="#0f6353"/></linearGradient>')
    a(f'<linearGradient id="soil" x1="0" y1="0" x2="0" y2="1">'
      f'<stop offset="0" stop-color="#2f5d43"/><stop offset="100%" stop-color="#123322"/></linearGradient>')
    a(f'<radialGradient id="vig" cx="50%" cy="45%" r="72%">'
      f'<stop offset="60%" stop-color="#000000" stop-opacity="0"/>'
      f'<stop offset="100%" stop-color="#04150e" stop-opacity="0.55"/></radialGradient>')
    a('</defs>')
    # ---------------- background ----------------
    a(f'<rect width="{W}" height="{H}" fill="url(#sky)"/>')
    a(f'<circle cx="{cx}" cy="{0.18*H}" r="{0.40*S}" fill="url(#glow)"/>')
    # ---------------- soil + plot row (drawn BEFORE the tree so the trunk sits on it) ----------------
    a(f'<rect x="0" y="{ground}" width="{W}" height="{H-ground}" fill="url(#soil)"/>')
    pw = 0.115 * W
    gapc = 0.24 * W                      # clear gap in the middle for the trunk
    left_x = gapc/2 + (cx - gapc/2 - gapc/2 - 2*pw)/3
    xs = [gapc/2, gapc/2 + pw + (cx - gapc - 2*pw)/3,
          W - gapc/2 - pw - (cx - gapc - 2*pw)/3, W - gapc/2 - pw]
    for px in xs:
        a(f'<rect x="{px:.1f}" y="{ground+0.016*H:.1f}" width="{pw:.1f}" height="{0.038*H:.1f}" '
          f'rx="{0.012*H:.1f}" fill="#0f3325" stroke="#2f5d43" stroke-width="{max(2,S*0.004):.1f}"/>')
    # ---------------- mid-ground garden band (fills the sides) ----------------
    def bush(bx, by, r, c1="#2b6b4a", c2="#3a8a5f"):
        o = [f'<circle cx="{bx:.1f}" cy="{by:.1f}" r="{r:.1f}" fill="{c1}"/>',
             f'<circle cx="{bx-r*0.55:.1f}" cy="{by+r*0.15:.1f}" r="{r*0.7:.1f}" fill="{c2}"/>',
             f'<circle cx="{bx+r*0.55:.1f}" cy="{by+r*0.2:.1f}" r="{r*0.66:.1f}" fill="{c1}"/>']
        o.append(leaf(bx, by+r*0.5, r*1.5, r*0.6, -12, "#1f5138", "#2f7355"))
        return "".join(o)
    for bx, by, r in [(0.055, 0.60, 0.055), (0.17, 0.66, 0.045), (0.29, 0.61, 0.05),
                      (0.71, 0.61, 0.05), (0.83, 0.66, 0.045), (0.945, 0.60, 0.055)]:
        a(bush(bx*W, by*H, r*S))
    for fx, fy, col in [(0.10, 0.68, PURPLE), (0.22, 0.71, PINK), (0.78, 0.71, ORANGE), (0.90, 0.68, PINK)]:
        a(flower(fx*W, fy*H, 0.02*S, col, 5))
    # ---------------- World Tree ----------------
    tw = 0.055 * S
    base_y = ground + 0.05 * H
    a(f'<circle cx="{cx}" cy="{canopy_cy}" r="{canopy_r*1.15}" fill="url(#glow)"/>')
    # roots
    for sgn in (-1, 1):
        a(f'<path d="M {cx+sgn*tw*0.9:.1f} {base_y:.1f} q {sgn*tw*1.4:.1f} {0.015*H:.1f} '
          f'{sgn*tw*2.6:.1f} {0.008*H:.1f}" stroke="url(#trunk)" stroke-width="{tw*0.62:.1f}" '
          f'fill="none" stroke-linecap="round"/>')
    # tall visible trunk (flared at the base)
    a(f'<path d="M {cx-tw*0.55:.1f} {canopy_cy+canopy_r*0.42:.1f} '
      f'C {cx-tw*0.9:.1f} {canopy_cy+canopy_r*1.0:.1f}, {cx-tw*1.15:.1f} {base_y*0.72:.1f}, '
      f'{cx-tw*1.25:.1f} {base_y:.1f} '
      f'L {cx+tw*1.25:.1f} {base_y:.1f} '
      f'C {cx+tw*1.15:.1f} {base_y*0.72:.1f}, {cx+tw*0.9:.1f} {canopy_cy+canopy_r*1.0:.1f}, '
      f'{cx+tw*0.55:.1f} {canopy_cy+canopy_r*0.42:.1f} Z" fill="url(#trunk)"/>')
    # bark shading + a knot
    a(f'<path d="M {cx-tw*0.15:.1f} {canopy_cy+canopy_r*0.6:.1f} L {cx-tw*0.25:.1f} {base_y*0.98:.1f}" '
      f'stroke="#3a2410" stroke-width="{tw*0.16:.1f}" opacity="0.5"/>')
    a(f'<ellipse cx="{cx+tw*0.3:.1f}" cy="{base_y*0.86:.1f}" rx="{tw*0.22:.1f}" ry="{tw*0.3:.1f}" fill="#3a2410" opacity="0.55"/>')
    # two lower branches
    for sgn in (-1, 1):
        a(f'<path d="M {cx:.1f} {canopy_cy+canopy_r*0.9:.1f} q {sgn*tw*1.8:.1f} {-canopy_r*0.12:.1f} '
          f'{sgn*tw*3.0:.1f} {-canopy_r*0.42:.1f}" stroke="url(#trunk)" stroke-width="{tw*0.5:.1f}" '
          f'fill="none" stroke-linecap="round"/>')
    # canopy mass (upper only, so the trunk stays visible)
    for dx, dy, r in [(-0.58, 0.06, 0.58), (0.58, 0.06, 0.58), (0, -0.42, 0.62),
                      (-0.32, -0.12, 0.56), (0.32, -0.12, 0.56), (-0.18, 0.28, 0.44), (0.18, 0.28, 0.44)]:
        a(f'<circle cx="{cx+dx*canopy_r:.1f}" cy="{canopy_cy+dy*canopy_r:.1f}" r="{r*canopy_r:.1f}" fill="url(#canopy)"/>')
    a(f'<circle cx="{cx-0.20*canopy_r:.1f}" cy="{canopy_cy-0.34*canopy_r:.1f}" '
      f'r="{0.32*canopy_r:.1f}" fill="#9df0d4" opacity="0.45"/>')
    # soil mound so the trunk looks planted, not cut off
    a(f'<ellipse cx="{cx:.1f}" cy="{base_y-0.004*H:.1f}" rx="{tw*3.0:.1f}" ry="{0.016*H:.1f}" fill="#183a29"/>')
    a(f'<ellipse cx="{cx:.1f}" cy="{base_y-0.008*H:.1f}" rx="{tw*2.0:.1f}" ry="{0.011*H:.1f}" fill="#22503a"/>')
    # anchored gold fruits
    for dx, dy in [(-0.46, 0.22), (0.44, 0.08), (-0.10, -0.30), (0.22, 0.32), (-0.34, -0.18), (0.50, 0.34)]:
        fx, fy = cx + dx * canopy_r, canopy_cy + dy * canopy_r
        a(f'<path d="M {fx:.1f} {fy-0.09*canopy_r:.1f} L {fx:.1f} {fy:.1f}" stroke="#0f6353" '
          f'stroke-width="{max(1.5,S*0.004):.1f}"/>')
        a(f'<circle cx="{fx:.1f}" cy="{fy:.1f}" r="{0.05*canopy_r:.1f}" fill="{GOLD}"/>')
    # ---------------- MERGE MOMENT (foreground, clear) ----------------
    a(f'<ellipse cx="{mcx:.1f}" cy="{mcy+ms*0.85:.1f}" rx="{ms*2.2:.1f}" '
      f'ry="{ms*0.28:.1f}" fill="#04150e" opacity="0.35"/>')
    a(f'<circle cx="{mcx}" cy="{mcy-ms*0.62}" r="{ms*1.9}" fill="url(#glow)"/>')
    lx, rx = mcx - ms * 1.34, mcx + ms * 1.34
    baseY = mcy + ms * 0.72
    a(sprout(lx, baseY, ms * 0.80))
    a(sprout(rx, baseY, ms * 0.80))
    # transformation ring + burst of magical particles
    a(f'<circle cx="{mcx}" cy="{mcy-ms*0.62}" r="{ms*0.66}" fill="none" stroke="{GOLD}" '
      f'stroke-width="{ms*0.05:.1f}" opacity="0.9"/>')
    a(f'<circle cx="{mcx}" cy="{mcy-ms*0.62}" r="{ms*0.84}" fill="url(#flash)"/>')
    for i in range(14):
        ang = math.radians(i * (360/14) + 9)
        d = ms * (0.52 + 0.46 * ((i % 3) / 2))
        px, py = mcx + math.cos(ang) * d, (mcy - ms * 0.62) + math.sin(ang) * d
        rr = ms * (0.055 if i % 2 else 0.035)
        a(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="{rr:.1f}" fill="{GOLD if i % 3 else CYAN}" opacity="0.95"/>')
    # the upgraded plant emerging from the burst
    a(f'<path d="M {mcx:.1f} {mcy-ms*0.3:.1f} L {mcx:.1f} {mcy-ms*1.0:.1f}" stroke="#2e7d32" '
      f'stroke-width="{ms*0.11:.1f}" stroke-linecap="round"/>')
    a(leaf(mcx, mcy - ms * 0.52, ms * 0.5, ms * 0.24, -42, LEAF1))
    a(leaf(mcx, mcy - ms * 0.68, ms * 0.5, ms * 0.24, 42, LEAF2))
    a(flower(mcx, mcy - ms * 1.18, ms * 0.56, PINK))
    # beams + arrowheads drawn LAST so nothing covers them (tips sit outside the ring)
    for sgn in (-1, 1):
        sx, sy = mcx + sgn * ms * 1.34, baseY - ms * 0.70
        ex, ey = mcx + sgn * ms * 0.74, mcy - ms * 0.62
        a(f'<line x1="{sx:.1f}" y1="{sy:.1f}" x2="{ex:.1f}" y2="{ey:.1f}" stroke="{ACCENT}" '
          f'stroke-width="{ms*0.075:.1f}" stroke-linecap="round" opacity="0.95"/>')
        dx, dy = ex - sx, ey - sy
        L = math.hypot(dx, dy) or 1
        ux, uy = dx / L, dy / L
        px, py = -uy, ux
        tipx, tipy = ex, ey
        bcx, bcy = tipx - ux * ms * 0.30, tipy - uy * ms * 0.30
        p1x, p1y = bcx + px * ms * 0.17, bcy + py * ms * 0.17
        p2x, p2y = bcx - px * ms * 0.17, bcy - py * ms * 0.17
        a(f'<path d="M {tipx:.1f} {tipy:.1f} L {p1x:.1f} {p1y:.1f} L {p2x:.1f} {p2y:.1f} Z" fill="{ACCENT}"/>')
    coin(mcx - ms * 1.72, baseY - ms * 0.02, ms * 0.16)
    coin(mcx + ms * 1.68, baseY + ms * 0.02, ms * 0.16)
    coin(mcx + ms * 1.98, baseY + ms * 0.12, ms * 0.12)
    # balancing foreground plant cluster (lower-left)
    a(bush(0.20 * W, 0.86 * H, 0.085 * S))
    a(flower(0.13 * W, 0.90 * H, 0.030 * S, PURPLE, 5))
    a(flower(0.27 * W, 0.92 * H, 0.024 * S, ORANGE, 5))
    # ---------------- sparkles ----------------
    for fx, fy, col in [(0.20, 0.28, CYAN), (0.80, 0.24, GOLD), (0.28, 0.50, ACCENT),
                        (0.74, 0.52, PINK), (0.50, 0.20, GOLD), (0.14, 0.58, CYAN),
                        (0.86, 0.58, ACCENT), (0.60, 0.38, GOLD), (0.40, 0.42, CYAN)]:
        a(star(fx * W, fy * H, 0.015 * S, col, 0.9))
    # ---------------- ground flowers ----------------
    for fx, fy, col in [(0.12, 0.905, PURPLE), (0.28, 0.93, PINK), (0.72, 0.91, ORANGE),
                        (0.88, 0.94, PINK), (0.50, 0.945, PURPLE)]:
        a(flower(fx * W, fy * H, 0.026 * S, col, 5))
    # ---------------- foreground leaf frame (fills corners, adds depth) ----------------
    big = 0.30 * S
    for k, (bx, by, rot, sc, col) in enumerate([
            (0.02 * W, H * 0.99, -28, 1.0, LEAFD), (0.16 * W, H * 1.01, -8, 0.82, LEAFD),
            (0.99 * W, H * 0.99, 28, 1.0, LEAFD), (0.84 * W, H * 1.01, 8, 0.82, LEAFD),
            (0.30 * W, H * 1.02, -14, 0.62, "#26604a"), (0.70 * W, H * 1.02, 14, 0.62, "#26604a")]):
        a(leaf(bx, by, big * sc, big * sc * 0.42, rot, col, "#2f7355"))
    # side vines for wide layouts
    for sgn in (-1, 1):
        vx = cx + sgn * (0.44 * W if W > H else 0.42 * W)
        for k in range(4):
            a(leaf(vx, 0.26 * H + k * 0.15 * H, 0.15 * S, 0.07 * S,
                   sgn * (62 - k * 12), "#1f5138", "#2f7355"))
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
