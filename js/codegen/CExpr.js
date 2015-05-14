export default class CExpr {
    constructor(fold) {
        this.fold = fold;
    }

    static Var() {
        return new CExpr((x, f, g, h, i, j, k) => {
            return x;
        });
    };

    static Constant(a, b) {
        return new CExpr((x, f, g, h, i, j, k) => {
            return f(a, b);
        });
    }

    static Add(z, w) {
        return new CExpr((x, f, g, h, i, j, k) => {
            return g(z.fold(x, f, g, h, i, j, k), w.fold(x, f, g, h, i, j, k));
        });
    }

    static Mul(z, w) {
        return new CExpr((x, f, g, h, i, j, k) => {
            return h(z.fold(x, f, g, h, i, j, k), w.fold(x, f, g, h, i, j, k));
        });
    }

    static Sub(z, w) {
        return new CExpr((x, f, g, h, i, j, k) => {
            return i(z.fold(x, f, g, h, i, j, k), w.fold(x, f, g, h, i, j, k));
        });
    }

    static Div(z, w) {
        return new CExpr((x, f, g, h, i, j, k) => {
            return j(z.fold(x, f, g, h, i, j, k), w.fold(x, f, g, h, i, j, k));
        });
    }

    static Pow(z, n) {
        return new CExpr((x, f, g, h, i, j, k) => {
            return k(z.fold(x, f, g, h, i, j, k), n);
        });
    }

    compile() {
        const mul = ([a, b], [c, d]) => 
            [`(${a} * ${c} - ${b} * ${d})`, `(${a} * ${d} + ${b} * ${c})`];

        const [a, b] = this.fold(
            ['z.x', 'z.y'],
            (a, b) => [a.toExponential(), b.toExponential()],
            ([a, b], [c, d]) => {
                [`(${a} + ${c})`, `(${b} + ${d})`];
            },
            (z, w) => {
                return mul(z, w);
            },
            ([a, b], [c, d]) => {
                return [`${a} - ${c}`, `${b} - ${d}`];
            },
            ([a, b], [c, d]) => {
                return [`${a} * ${c} + ${b} * ${d} / ${c} * ${c} + ${d} * ${d}`, `${b} * ${c} - ${a} * ${d} / ${c} * ${c} + ${d} * ${d}`];
            },
            (z, n) => {
                var acc = ['1.0', '0.0'];
                for(var i = 0; i < n; ++i) {
                     acc = mul(z, acc);
                 }
                 return acc;
            }
        );

        return `vec2 f(vec2 z) { return vec2(${a}, ${b}); }`;
    }
}
