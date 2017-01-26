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
    printAlignments: function(alignments, scoring, gap) {
        //      console.log(alignments);
        for (var i = 0; i < alignments.length; i++) {
            console.log('\n');
            var s = 0;
            for (var j = 0; j < alignments[i].sequenceA.length; j++) {
                if (alignments[i].sequenceA[j] == '-' || alignments[i].sequenceB[j] == '-')
                    s += gap;
                else s += scoring(alignments[i].sequenceA[j], alignments[i].sequenceB[j]);
            }
            console.log(alignments[i].sequenceA);
            console.log(alignments[i].sequenceB);
            console.log(s);
        }

    },
    getAlignments(matrix, paths, sequenceA, sequenceB) {

        var alignments = [];

        for (var i = 0; i < paths.length; i++) {

            var s = {
                sequenceA: '',
                sequenceB: '',
                score: matrix[paths[i][0][0]][paths[i][0][1]].score,
                matchSequence: '' //helper string, need to find a better name
            };

            for (var j = paths[i].length - 1; j >= 0; j--) {

                var p = paths[i][j];
                //  if(p[0] == p[1] && p[0] == 0) continue;

                var nextP = paths[i][j - 1];


                if (p[0] + 1 == nextP[0] && p[1] + 1 == nextP[1]) {
                    s.sequenceA += sequenceA[nextP[1] - 1];
                    s.sequenceB += sequenceB[nextP[0] - 1];
                    s.matchSequence += (sequenceA[nextP[1] - 1] == sequenceB[nextP[0] - 1]) ? '|' : ' ';

                } else if (p[1] + 1 == nextP[1]) {
                    s.sequenceA += sequenceA[nextP[1] - 1];
                    s.sequenceB += '-';
                    s.matchSequence += ' ';
                } else if (p[0] + 1 == nextP[0]) {
                    s.sequenceA += '-';
                    s.sequenceB += sequenceB[nextP[0] - 1];
                    s.matchSequence += ' ';
                }

                if (j - 1 == 0) break;


            }
            s.path = paths[i];
            alignments.push(s);
        }

        return alignments;
    },
    traceBack(matrix, local) {

        var paths = [];
        var watchdog = 1000;

        function follow(p) {
            var r = p[p.length - 1][0];
            var c = p[p.length - 1][1];
            if(watchdog -- <= 0) return;
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

                if (r == c && r == 0) break;

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
    align: function(sequenceA, sequenceB, scoring, gap, local) {
        console.log('building score matrix');
        var m = this.buildMatrix(sequenceB.length + 1, sequenceA.length + 1);


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
                var diag = m[r - 1][c - 1].score + scoring(sequenceA[c - 1], sequenceB[r - 1]);
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

        console.log('building alignments');
        var alignments = this.getAlignments(m, paths, sequenceA, sequenceB);
        console.log('found ' + alignments.length + ' alignments');

        this.printAlignments(alignments, scoring, gap);

        return {
            matrix: m,
            alignments: alignments
        };
    }

};
