Array.prototype.clone = function(){
    return this.concat();
}

var printf = require('printf');
var sleep = require('sleep');

function hungary(matrix) {
    
    transform(matrix);
    
    var order = matrix.length, r, marks = new Array(order + 2);
    marks[order] = [], marks[order + 1] = [];
    while(true) {
        for (r = 0; r < order; r++) {
            marks[r] = [];
            marks[r][order] = marks[order][r] = -1;
            marks[r][order + 1] = marks[order + 1][r] = 0;
        }
        marks[order][order] = marks[order + 1][order + 1] = 0;
        marks[order][order + 1] = marks[order + 1][order] = '';
print(matrix, marks, '初始化标记矩阵：');
        
        mark(matrix, marks);
        
print(matrix, marks, '独立0元素的个数：' + marks[order][order]);
        if (marks[order][order] === order) {
            return solve(matrix);
        }
        lining(matrix, marks);
        
print(matrix, marks, '覆盖0元素的最少直线数：' + marks[order + 1][order + 1]);
        if (marks[order + 1][order + 1] === order) {
            return solve(matrix);
        } else if (marks[order + 1][order + 1] < order) {
            adjust(matrix, marks);
        }
    }
}

function solve(matrix) {
    var solutions = [], solut = new Array(matrix.length);
    solve0(matrix, 0, solutions, solut);
    return solutions;
}

function solve0(matrix, col, solutions, solut) {
    var order = matrix.length, row;
    if (col >= order) {
        solutions.push(solut.clone());
    }
    
    for (row = 0; row < order; row++) {
        if (solut[row] !== undefined) continue;
        if (matrix[row][col] === 0) {
            solut[row] = col;
            solve0(matrix, col + 1, solutions, solut);
            solut[row] = undefined;
        }
    }    
}

function adjust(matrix, marks) {
    var order = matrix.length, r, c, min = 9e18;
    
    // 未划线的元素的最小值
    for (r = 0; r < order; r++) {
        if (marks[r][order + 1] === 3) continue;
        for (c = 0; c < order; c++) {
            if (marks[order + 1][c] === 3) continue;
            if (min > matrix[r][c]) {
                min = matrix[r][c];
            }
        }
    }
print(matrix, marks, '未划线(!3)的元素的最小值：' + min);

    for (r = 0; r < order; r++) {
        if (marks[r][order + 1] !== 2) continue;
        for (c = 0; c < order; c++) {
            matrix[r][c] -= min;
        }
    }
print(matrix, marks, '未打对号(3)的行减去最小值：' + min);

    for (c = 0; c < order; c++) {
        if (marks[order + 1][c] !== 3) continue;
        for (r = 0; r < order; r++) {
            matrix[r][c] += min;
        }
    }
print(matrix, marks, '已打对号(3)的列加上最小值：' + min);
}

function lining(matrix, marks) {
    var order = matrix.length, r, c, k, lined = true;
    for (r = 0; r < order; r++) {
        if (marks[r][order] > -1) continue;
        marks[r][order + 1] = 1;
    }
print(matrix, marks, '未标记()的行打对号(1)：');

    while(lined) {
        lined = false;
        for (r = 0; r < order; r++) {
            if (marks[r][order + 1] !== 1) continue;
            if (marks[r][order + 1] === 2) continue;
            for (c = 0; c < order; c++) {
                if (marks[order + 1][c] !== 1 && matrix[r][c] === 0) {
                    marks[order + 1][c] = 1;
                    for (k = 0; k < order; k++) {
                        if (marks[k][c] === '()') {
                            marks[k][order + 1] = 1;
                        }
                    }
                }
            }
            marks[r][order + 1] = 2;
            lined = true;
print(matrix, marks, '已打对号(1->2)的行的0元素所在的列打对号(1)\n同时打对号的列(1)上标记()的行打对号(1)：');
        }
    }
    
    for (r = 0; r < order; r++) {
        if (marks[r][order + 1] !== 2) {
            marks[r][order + 1] = 3;
            marks[order + 1][order + 1]++;
        }
    }
print(matrix, marks, '未打对号的行(!2)划线(3):');
    for (c = 0; c < order; c++) {
        if (marks[order + 1][c] === 1) {
            marks[order + 1][c] = 3;
            marks[order + 1][order + 1]++;
        }
    }
print(matrix, marks, '打对号的列(1)划线(3):');
}

function mark(matrix, marks) {
    var order = matrix.length, r, c, k, nzero;
    // 统计各行各列0元素的个数
    for (r = 0; r < order; r++) {
        if (marks[r][order] > -1) continue;
        for (c = 0; c < order; c++) {
            if (marks[order][c] > -1) continue;
            if (marks[r][c] === undefined && matrix[r][c] === 0) {
                marks[r][order + 1]++;
                marks[order + 1][c]++;
            }
        }
    }
print(matrix, marks, '统计各行各列0元素的个数：');

    while(true) {
        // 最少0元素的个数
        nzero = order + 1;
        for (r = 0; r < order; r++) {
            if (marks[r][order + 1] === 0) continue;
            if (nzero > marks[r][order + 1]) {
                nzero = marks[r][order + 1];
            }
        }
        for (c = 0; c < order; c++) {
            if (marks[order + 1][c] === 0) continue;
            if (nzero > marks[order + 1][c]) {
                nzero = marks[order + 1][c];
            }
        }
        nzero %= order + 1;
print(matrix, marks, '最少0元素的个数：' + nzero);
    
        // 没有可以标记的了
        if (nzero === 0) return;
        
        for (r = 0; r < order; r++) {
            if (marks[r][order] > -1) continue;
            if (nzero === marks[r][order + 1]) {
                for (c = 0; c < order; c++) {
                    if (marks[order][c] > -1) continue;  // 已标记()
                    if (matrix[r][c] === 0 && marks[r][c] === undefined) {
                        marks[r][c] = '()';
                        marks[order][order]++;
                        marks[r][order] = c, marks[order][c] = r;
                        marks[r][order + 1] = marks[order + 1][c] = 0;
                        for (k = 0; k < order; k++) {
                            if (k !== r && matrix[k][c] === 0 && marks[k][c] === undefined) {
                                marks[k][c] = '*';
                                marks[k][order + 1]--;
                            }
                        }
                        // 如果该行只有一个0，不再扫描
                        if (nzero === 1) continue;
                        for (k = 0; k < order; k++) {
                            if (k !== c && matrix[r][k] === 0 && marks[r][k] === undefined) {
                                marks[r][k] = '*';
                                marks[order + 1][k]--;
                            }
                        }
                    }
                }
            }
        }
print(matrix, marks, '标记0元素最少的行：');
        for (c = 0; c < order; c++) {
            if (marks[order][c] > -1) continue;
            if (nzero === marks[order + 1][c]) {
                for (r = 0; r < order; r++) {
                    if (marks[r][order] > -1) continue;  // 已标记()
                    if (matrix[r][c] === 0 && marks[r][c] === undefined) {
                        marks[r][c] = '()';
                        marks[order][order]++;
                        marks[r][order] = c, marks[order][c] = r;
                        marks[r][order + 1] = marks[order + 1][c] = 0;
                        for (k = 0; k < order; k++) {
                            if (k !== c && matrix[r][k] === 0 && marks[r][k] === undefined) {
                                marks[r][k] = '*';
                                marks[order + 1][k]--;
                            }
                        }
                        // 如果该列只有一个0，不再扫描
                        if (nzero === 1) continue;
                        for (k = 0; k < order; k++) {
                            if (k !== r && matrix[k][c] === 0 && marks[k][c] === undefined) {
                                marks[k][c] = '*';
                                marks[k][order + 1]--;
                            }
                        }
                    }
                }
            }
        }
print(matrix, marks, '标记0元素最少的列：');
    }
}

function transform(matrix) {
    var order = matrix.length, r, c, min;
    lineScanLabel:
    for (r = 0; r < order; r++) {
        min = 9e18;
        for (c = 0; c < order; c++) {
            if (matrix[r][c] === 0) {
                continue lineScanLabel;
            }
            if (min > matrix[r][c]) {
                min = matrix[r][c];
            }
        }
        for (c = 0; c < order; c++) {
            matrix[r][c] -= min;
        }
    }
print(matrix, '各行减去它们的最小值：');

    columnScanLabel:
    for (c = 0; c < order; c++) {
        min = 9e18;
        for (r = 0; r < order; r++) {
            if (matrix[r][c] === 0) {
                continue columnScanLabel;
            }
            if (min > matrix[r][c]) {
                min = matrix[r][c];
            }
        }
        if (min === 0) continue;
        for (r = 0; r < order; r++) {
            matrix[r][c] -= min;
        }
    }
print(matrix, '各列减去它们的最小值：');
}

function testHungary() {
    var matrix = [
        [10, 9, 7, 8],
        [ 5, 8, 7, 7],
        [ 5, 4, 6, 5],
        [ 2, 3, 4, 5]
    ];

/*    
    var matrix = [
        [6, 7, 11, 2],
        [4, 5,  9, 8],
        [3, 1, 10, 4],
        [5, 9,  8, 2]
    ];
*/
    print(matrix, '原矩阵：');
    
    var cmatrix = [];
    for (var r = 0; r < matrix.length; r++) {
        cmatrix[r] = matrix[r].clone();
    }
    var solutions = hungary(cmatrix);
    printOptimal(matrix, solutions);
}

function printOptimal(matrix, solutions) {
    console.log('最优解：');
    var order = matrix.length, n, r, c, txt;
    for (n = 0; n < solutions.length; n++) {
        console.log('-----------------------------------');
        for  (r = 0; r < order; r++) {
            txt = '';
            for (c = 0; c < order; c++) {
                if (solutions[n][r] === c) {
                    txt += printf(' %4s)', '(' + matrix[r][c]);
                } else {
                    txt += printf(' %4s ', matrix[r][c]);
                }
            }
            console.log(txt);
        }
        console.log('-----------------------------------');
    }
}

function print(matrix, marks, message, debug) {
    return;
    
    if (debug === undefined) debug = true;
    if (typeof marks === 'string') {
        console.log(marks);
        marks = undefined;
    }
    if (message) console.log(message);
    console.log('----------------------------------------');
    var order = matrix.length, r, c, txt;
    if (!marks) {
      for (r = 0; r < order; r++) {
          txt = '';
          for (c = 0; c < order; c++) {
              txt += printf(' %4d ', matrix[r][c]);
          }
          console.log(txt);
      }  
    } else {
        for (r = 0; r <= order + 1; r++) {
            txt = '';
            for (c = 0; c <= order + 1; c++) {
                if (marks[r][c] === '()') {
                    txt += printf(' %4s)', '(' + matrix[r][c]);
                } else if (marks[r][c] === '*' && debug) {
                    txt += printf(' %4s*', matrix[r][c]);
                } else if (r >= order || c >= order) {
                    txt += debug ? printf(' %4s`', marks[r][c]) : '';
                } else {
                    txt += printf(' %4s ', matrix[r][c]);
                }
            }
            console.log(txt);
        }
    }
    console.log();
    // sleep.sleep(1);
}

testHungary();