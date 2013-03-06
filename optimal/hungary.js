var printf = require('printf');
var sleep = require('sleep');

function hungary(matrix) {
    
    var order = matrix.length, r, marks = new Array(order + 2);
    marks[order] = [], marks[order + 1] = [];
    for (r = 0; r < order; r++) {
        marks[r] = [];
        marks[r][order] = marks[order][r] = -1;
    }
    marks[order][order] = 0;
    marks[order][order + 1] = marks[order + 1][order] = '';
    
    transform(matrix);
    
    while(true) {
        for (r = 0; r < order; r++) {
            marks[r][order + 1] = marks[order + 1][r] = 0;
        }
        marks[order + 1][order + 1] = 0;
print(matrix, marks);
        
        while(mark(matrix, marks));
        
//        console.log(marks[order][order] + ' ' + order);
        if (marks[order][order] === order) return marks;
        
        lining(matrix, marks);
        
        if (marks[order + 1][order + 1] === order) {
            return marks;
        } else if (marks[order + 1][order + 1] < order) {
            adjust(matrix, marks);
        }
    }
}

function adjust(matrix, marks) {
    var order = matrix.length, r, c, min = 9e18;
    
    for (r = 0; r < order; r++) {
        if (marks[r][order + 1] === 3) continue;
        for (c = 0; c < order; c++) {
            if (marks[order + 1][c] === 3) continue;
            if (min > matrix[r][c]) {
                min = matrix[r][c];
            }
        }
    }
    for (r = 0; r < order; r++) {
        if (marks[r][order + 1] !== 2) continue;
        for (c = 0; c < order; c++) {
            matrix[r][c] -= min;
        }
    }
print(matrix, marks);

    for (c = 0; c < order; c++) {
        if (marks[order + 1][c] !== 3) continue;
        for (r = 0; r < order; r++) {
            matrix[r][c] += min;
        }
    }
print(matrix, marks);
}

function lining(matrix, marks) {
    var order = matrix.length, r, c, k, lined = true;
    for (r = 0; r < order; r++) {
        if (marks[r][order] > -1) continue;
        marks[r][order + 1] = 1;
    }
print(matrix, marks);

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
print(matrix, marks);
        }
    }
    
    for (r = 0; r < order; r++) {
        if (marks[r][order + 1] !== 2) {
            marks[r][order + 1] = 3;
            marks[order + 1][order + 1]++;
        }
    }
    for (c = 0; c < order; c++) {
        if (marks[order + 1][c] === 1) {
            marks[order + 1][c] = 3;
            marks[order + 1][order + 1]++;
        }
    }
print(matrix, marks);
}

function mark(matrix, marks) {
    var order = matrix.length, r, c, k, minzero;
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
print(matrix, marks);
    
    // 最少0元素的个数
    minzero = order + 1;
    for (r = 0; r < order; r++) {
        if (marks[r][order + 1] === 0) continue;
        if (minzero > marks[r][order + 1]) {
            minzero = marks[r][order + 1];
        }
    }
    for (c = 0; c < order; c++) {
        if (marks[order + 1][c] === 0) continue;
        if (minzero > marks[order + 1][c]) {
            minzero = marks[order + 1][c];
        }
    }

//console.log(minzero);
    // 没有可以标记的了
    if (minzero === order + 1) return false;
    
    for (r = 0; r < order; r++) {
        if (marks[r][order] > -1) continue;
        if (minzero === marks[r][order + 1]) {
            for (c = 0; c < order; c++) {
                if (marks[order][c] > -1) continue;  // 已标记()
                if (matrix[r][c] === 0) {
                    marks[r][c] = '()';
                    marks[order][order]++;
                    marks[r][order] = c, marks[order][c] = r;
                    marks[r][order + 1] = marks[order + 1][c] = 0;
                    for (k = 0; k < order; k++) {
                        if (k !== r && matrix[k][c] === 0 && marks[k][c] !== '*') {
                            marks[k][c] = '*';
                            marks[k][order + 1]--;
                        }
                    }
                    for (k = 0; k < order; k++) {
                        if (k !== c && matrix[r][k] === 0 && marks[r][k] !== '*') {
                            marks[r][k] = '*';
                            marks[order + 1][k]--;
                        }
                    }
                }
            }
        }
    }
print(matrix, marks);
    for (c = 0; c < order; c++) {
        if (marks[order][c] > -1) continue;
        if (minzero === marks[order + 1][c]) {
            for (r = 0; r < order; r++) {
                if (marks[r][order] > -1) continue;  // 已标记()
                if (matrix[r][c] === 0) {
                    marks[r][c] = '()';
                    marks[order][order]++;
                    marks[r][order] = c, marks[order][c] = r;
                    marks[r][order + 1] = marks[order + 1][c] = 0;
                    for (k = 0; k < order; k++) {
                        if (k !== r && matrix[k][c] === 0 && marks[k][c] !== '*') {
                            marks[k][c] = '*';
                            marks[k][order + 1]--;
                        }
                    }
                    for (k = 0; k < order; k++) {
                        if (k !== c && matrix[r][k] === 0 && marks[r][k] !== '*') {
                            marks[r][k] = '*';
                            marks[order + 1][k]--;
                        }
                    }
                }
            }
        }
    }
print(matrix, marks);
    return true;
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
print(matrix);

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
        for (r = 0; r < order; r++) {
            matrix[r][c] -= min;
        }
    }
print(matrix);
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
    
    Array.prototype.clone = function(){
     return this.concat();
    }
    
    var cmatrix = [];
    for (var r = 0; r < matrix.length; r++) {
        cmatrix[r] = matrix[r].clone();
    }
    var marks = hungary(cmatrix);
    print(matrix, marks, '最优解：', false);
}

function print(matrix, marks, message, debug) {
    if (debug === undefined) debug = true;
    if (typeof marks === 'string') {
        console.log(marks);
        marks = undefined;
    }
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
    //sleep.sleep(2);
}

testHungary();