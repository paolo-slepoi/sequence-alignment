var SequenceAlignemnt = {
    buildMatrix: function(rows, cols) {
        var m = [];
        for (var r = 0; r < rows; r++) {
            m[r] = [];
            for (var c = 0; c < cols; c++) {
                m[r][c] = {
                    score: 0,
                    up: false,
                    left: false,
                    diag: false,
                    path: false
                };
            }
        }

        return m;
    },
    printSequences: function(sequences, scoring, gap) {
        //      console.log(sequences);
        for (var i = 0; i < sequences.length; i++) {
            console.log('\n');
            var s = 0;
            for (var j = 0; j < sequences[i].stringA.length; j++) {
                if (sequences[i].stringA[j] == '-' || sequences[i].stringB[j] == '-')
                    s += gap;
                else s += scoring(sequences[i].stringA[j], sequences[i].stringB[j]);
            }
            console.log(sequences[i].stringA);
            console.log(sequences[i].stringB);
            console.log(s);
        }

    },
    getSequences(matrix, paths, stringA, stringB) {

        var sequences = [];

        for (var i = 0; i < paths.length; i++) {

            var s = {
                stringA: '',
                stringB: '',
                score: matrix[paths[i][0][0]][paths[i][0][1]].score
            };

            for (var j = paths[i].length - 1; j >= 0; j--) {

                var p = paths[i][j];
                //  if(p[0] == p[1] && p[0] == 0) continue;

                var nextP = paths[i][j - 1];


                if (p[0] + 1 == nextP[0] && p[1] + 1 == nextP[1]) {
                    s.stringA += stringA[nextP[1] - 1];
                    s.stringB += stringB[nextP[0] - 1];
                } else if (p[1] + 1 == nextP[1]) {
                    s.stringA += stringA[nextP[1] - 1];
                    s.stringB += '-';
                } else if (p[0] + 1 == nextP[0]) {
                    s.stringA += '-';
                    s.stringB += stringB[nextP[0] - 1];
                }

                if (j - 1 == 0) break;


            }
            s.path = paths[i];
            sequences.push(s);
        }

        return sequences;
    },
    traceBack(matrix, local) {

        var paths = [];

        function follow(p) {
            var r = p[p.length - 1][0];
            var c = p[p.length - 1][1];
            while (r >= 0 && c >= 0) {
                var flag = false;
                var i = r;
                var j = c;
                var _p;

                if (local && matrix[i][j].score == 0) break;

                if (matrix[i][j].diag) {
                    _p = ([--r, --c]);
                    flag = true;
                }

                if (matrix[i][j].up) {
                    if (flag) {
                        var s = p.slice();
                        s.push([i - 1, j]);
                        //      paths.push(s);
                        follow(s);
                    } else
                        _p = ([--r, c]);
                    flag = true;
                }

                if (matrix[i][j].left) {
                    if (flag) {
                        var s = p.slice();
                        s.push([i, j - 1]);
                        //      paths.push(s);
                        follow(s);
                    } else
                        _p = ([r, --c]);
                }

                if (_p)
                    p.push(_p);

                if(r == c && r == 0) break;

            }

            if (
                (local && matrix[p[p.length - 1][0]][p[p.length - 1][1]].score == 0) ||
                (!local && r == 0 && c == 0))
                paths.push(p);


        }

        if (local) {
            var max = matrix[0][0];

            for (var i = 0; i < matrix.length; i++)
                for (var j = 0; j < matrix[i].length; j++)
                    max = max > matrix[i][j].score ? max : matrix[i][j].score;

            if (max == 0) return [];

            for (var i = 0; i < matrix.length; i++)
                for (var j = 0; j < matrix[i].length; j++)
                    if (matrix[i][j].score == max)
                        follow([
                            [i, j]
                        ]);

        } else follow([
            [matrix.length - 1, matrix[0].length - 1]
        ]);

        for (var i = 0; i < paths.length; i++)
            for (var j = 0; j < paths[i].length; j++)
                matrix[paths[i][j][0]][paths[i][j][1]].path = true;

        return paths;
    },
    align: function(stringA, stringB, scoring, gap, local) {
        console.log('building score matrix');
        var m = this.buildMatrix(stringB.length + 1, stringA.length + 1);


        for (var r = 1; r < m.length; r++) {
            m[r][0].score = local ? 0 : (r * gap);
            m[r][0].up = true;
        }

        for (var c = 1, s = 0; c < m[0].length; c++) {
            m[0][c].score = local ? 0 : (c * gap);
            m[0][c].left = true;
        }

        for (var r = 1; r < m.length; r++) {
            for (var c = 1; c < m[r].length; c++) {

                var left = m[r][c - 1].score + gap;
                var up = m[r - 1][c].score + gap;
                var diag = m[r - 1][c - 1].score + scoring(stringA[c - 1], stringB[r - 1]);
                var score = Math.max(left, up, diag);

                // score = Math.max(left, up, diag,0);

                m[r][c].left = (left === score);
                m[r][c].up = (up === score);
                m[r][c].diag = (diag === score);

                m[r][c].score = score < 0 && local ? 0 : score;
            }
        }

        console.log('calculating paths');
        var paths = this.traceBack(m, local);
        console.log('found ' + paths.length + ' paths');

        console.log('building sequences');
        var sequences = this.getSequences(m, paths, stringA, stringB);
        console.log('found ' + sequences.length + ' sequences');

        this.printSequences(sequences, scoring, gap);

        return {
            matrix: m,
            sequences: sequences
        };
    }

};
