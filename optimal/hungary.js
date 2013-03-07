/*******************************************************************************
 * @date: 2013-03-07      @author: shangxuejin@gmail.com
 * 
 * 指派问题匈牙利解法的主要步骤：
 * 第一步：变换矩阵，使在各行各列都出现0元素
 *  (1) 从系数矩阵的每行元素减去该行的最小元素；
 *  (2) 再从所得系数矩阵的每列减去该列的最小元素。
 * 第二步：试指派
 *  (1) 检查矩阵的每行、每列，从中找出0元素最少的一排（行或列）。从这排中圈出
 *    一个0元素用“()”标注(如果该排存在多个0元素，则任圈一个)，该0元素同行同列
 *    的其他0元素用*标注。在剩下的0元素中重复上述过程，直至矩阵中没有0元素为止。
 *  (2) 如果矩阵中独立0元素（既不在同一行也不在同一列上）等于矩阵的阶数，则找到
 *    最优解；否则，继续第三步。
 * 第三步：作能覆盖所有0元素的最小直线集合
 *  (1) 对没有“()”的行打“√”号；
 *  (2) 对已打“√”号的行上的所有0元素所在的列打“√”号；
 *  (3) 再对已打“√”号的列上有“()”的行打“√”号；
 *  (4) 重复 (2)，(3) 直到得不出新的打“√”号为止；
 *  (5) 对没有打“√”号的行划横线，对打“√”号的列划纵线。
 *    这就是能覆盖所有0元素的最小直线集合，如果直线数等于矩阵的阶数，则这些0元
 *    素中一定存在最优解，对这些0元素试指派；如果直线数小于矩阵的阶数，转第四步。
 * 第四步：调整，以添加0元素
 *  在没有被直线覆盖的部分元素中找出最小元素，没有画直线的行的各元素都减去这最
 *  小元素，已画直线的列的各元素都加上这最小元素，得到的新的矩阵，转第二步。
 *******************************************************************************/

// 扩展javascript对象Array，添加多维数组深拷贝的方法
Array.prototype.clone = function(){
    var cloned = this.concat();
    for (var i = 0; i < this.length; i++) {
        if (cloned[i] instanceof Array) {
            cloned[i] = cloned[i].clone();
        }
    }
    return cloned;
};

// 打印日志和调试时用到的格式化和休眠模块
var printf = require('printf');
var sleep = require('sleep');

function hungary(matrix) {
    // 在指派过程中，矩阵会被转换和调整，所以这几里赋值一个矩阵，不改变原来的矩阵
    matrix = matrix.clone();
    var order, nrow = matrix.length, ncol = matrix[0].length;
        
    // 指派问题的匈牙利解法只适用于方阵
    complete(matrix);
    order = matrix.length;
    
    // 转换
    transform(matrix, nrow, ncol);
    
    while(true) {
        // 试指派
        var marks = mark(matrix);
        
        print(matrix, marks, '独立0元素的个数：' + marks[order][order]);
        // 如果独立0元素等于方阵的阶数，问题解决
        if (marks[order][order] === order) {
            return solve(matrix, nrow, ncol);
        }
        
        // 划覆盖0元素的最少直线
        lining(matrix, marks);
        
        print(matrix, marks, '覆盖0元素的最少直线数：' + marks[order + 1][order + 1]);
        // 如果覆盖0元素的最少直线数等于方阵的阶数，问题解决
        if (marks[order + 1][order + 1] === order) {
            return solve(matrix, nrow, ncol);
        } else if (marks[order + 1][order + 1] < order) {
            // 调整
            adjust(matrix, marks);
        }
    }
}

function complete(matrix) {
    var r, c, nrow = matrix.length, ncol = matrix[0].length;
    
    // 如果行数小于列数，补行成方阵
    for (r = nrow; r < ncol; r++) {
        matrix[r] = [];
        for (c = 0;  c < ncol; c++) {
            matrix[r][c] = 0;
        }
    }
    // 如果列数小于行数，补列成方阵
    for (c = ncol; c < nrow; c++) {
        for (r = 0; r < nrow; r++) {
            matrix[r][c] = 0;
        }
    }
    print(matrix, '补成方阵：');
    
}

// 这些0元素中一定存在最优解，对这些0元素递归试指派（可能存在多个解）
function solve(matrix, nrow, ncol) {
    var solutions = [], solut = new Array(nrow);
    // 安排第0列
    solve0(matrix, nrow, ncol, 0, solutions, solut);
    return solutions;
}

function solve0(matrix, nrow, ncol, col, solutions, solut) {
    var i;
    if (col >= ncol) {
        if (nrow < ncol) {
            for (i = 0; i < solut.length; i++) {
                if (solut[i] === undefined) return;
            }
        }
        solutions.push(solut.clone());
        return;
    }
    
    for (var row = 0; row < nrow; row++) {
        if (solut[row] !== undefined) continue;
        if (matrix[row][col] === 0) {
            solut[row] = col;
            if (level !== 'warn') console.log(solut);
            solve0(matrix, nrow, ncol, col + 1, solutions, solut);
            delete solut[row];
        }
    }
    if (nrow < ncol) {
        var nhas = 0;
        for (i = 0; i < solut.length; i++) {
            if (solut[i] === undefined) continue;
            nhas ++;
        }
        if (nhas + (ncol - (col + 1)) < nrow) return;
        solve0(matrix, nrow, ncol, col + 1, solutions, solut);
    }
}

// 调整，以添加0元素
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

// 作能覆盖所有0元素的最小直线集合
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
            print(matrix, marks, '已打对号(1->2)的行的0元素所在的列打对号(1)\n'
                + '同时打对号的列(1)上标记()的行打对号(1)：');
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

// 标记，试指派
function mark(matrix) {
    var order = matrix.length, r, c, k, nzero;
    var marks = new Array(order + 2);
    marks[order] = [], marks[order + 1] = [];
    for (r = 0; r < order; r++) {
        marks[r] = [];
        marks[r][order] = marks[order][r] = -1;
        marks[r][order + 1] = marks[order + 1][r] = 0;
    }
    marks[order][order] = marks[order + 1][order + 1] = 0;
    marks[order][order + 1] = marks[order + 1][order] = '';
    print(matrix, marks, '初始化标记矩阵：');
    
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
        if (nzero === order + 1) nzero = 0;
        print(matrix, marks, '最少0元素的个数：' + nzero);
    
        // 没有可以标记的了
        if (nzero === 0) break;
        
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
    return marks;
}

// 变换矩阵
function transform(matrix, nrow, ncol) {
    var r, c, min;
    // 如果列不足，那么每行必是补充了0，所以每行最小值必为0，无需变换；否则变换
    if (ncol >= nrow) { 
        lineScanLabel:
        for (r = 0; r < nrow; r++) {
            min = 9e18;
            for (c = 0; c < ncol; c++) {
                if (matrix[r][c] === 0) {
                    continue lineScanLabel;
                }
                if (min > matrix[r][c]) {
                    min = matrix[r][c];
                }
            }
            for (c = 0; c < ncol; c++) {
                matrix[r][c] -= min;
            }
        }
        print(matrix, '各行减去它们的最小值：');
    }
    // 如果行不足，那么每列必是补充了0，所以每列最小值必为0，无需变换；否则变换
    if (nrow >= ncol) {
        columnScanLabel:
        for (c = 0; c < ncol; c++) {
            min = 9e18;
            for (r = 0; r < nrow; r++) {
                if (matrix[r][c] === 0) {
                    continue columnScanLabel;
                }
                if (min > matrix[r][c]) {
                    min = matrix[r][c];
                }
            }
            if (min === 0) continue;
            for (r = 0; r < nrow; r++) {
                matrix[r][c] -= min;
            }
        }
        print(matrix, '各列减去它们的最小值：');
    }
}

// 输出最优解
function printOptimal(matrix, solutions) {
    console.log('最优解：');
    var n, r, c, txt, ttxt, total;
    for (n = 0; n < solutions.length; n++) {
        ttxt = '  ', total = 0;
        console.log('-----------------------------------');
        for  (r = 0; r < matrix.length; r++) {
            txt = '';
            for (c = 0; c < matrix[0].length; c++) {
                if (solutions[n][r] === c) {
                    total += matrix[r][c];
                    ttxt += printf('%d(%d:%d) + ', matrix[r][c], r + 1, c + 1);
                    txt += printf('%6s)', '(' + matrix[r][c]);
                } else {
                    txt += printf('%6s ', matrix[r][c]);
                }
            }
            console.log(txt);
        }
        console.log(ttxt.substring(0, ttxt.length - 3) + ' = ' + total);
        console.log('-----------------------------------');
    }
}

// 打印指派过程，休眠
function print(matrix, marks, message) {
    if (level === 'warn') return;
    if (typeof marks === 'string') {
        console.log(marks);
        marks = undefined;
    }
    if (message) console.log(message);
    console.log('----------------------------------------');
    var order = matrix.length, r, c, txt;
    if (!marks) {
      for (r = 0; r < matrix.length; r++) {
          txt = '';
          for (c = 0; c < matrix[0].length; c++) {
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
                } else if (marks[r][c] === '*') {
                    txt += printf(' %4s*', matrix[r][c]);
                } else if (r >= order || c >= order) {
                    txt += printf(' %4s`', marks[r][c]);
                } else {
                    txt += printf(' %4s ', matrix[r][c]);
                }
            }
            console.log(txt);
        }
    }
    console.log();
     if (level === 'debug') sleep.sleep(1);
}

// 测试
function testHungary() {
    var matrixes = [
        [ // 0
            [ 2, 15, 13,  4],
            [10,  4, 14, 15],
            [ 9, 14, 16, 13],
            [ 7,  8, 11,  9]
        ], [ // 1
            [12,  7,  9,  7,  9],
            [ 8,  9,  6,  6,  6],
            [ 7, 17, 12, 14,  9],
            [15, 14,  6,  6, 10],
            [ 4, 10,  7, 10,  9]
        ], [ // 2
            [10, 9, 7, 8],
            [ 5, 8, 7, 7],
            [ 5, 4, 6, 5],
            [ 2, 3, 4, 5]
        ], [ // 3
            [15, 18, 21, 24],
            [19, 23, 22, 18],
            [26, 17, 16, 19],
            [19, 21, 23, 17]
        ], [ // 4
            [ 2, 10,  9,  7],
            [15,  4, 14,  8],
            [13, 14, 16, 11],
            [ 4, 15, 13,  9]
        ], [ // 5
            [6, 7, 11, 2],
            [4, 5,  9, 8],
            [3, 1, 10, 4],
            [5, 9,  8, 2]
        ], [ // 6
            [10,  5,  9, 18, 11],
            [13, 19,  6, 12, 14],
            [ 3,  2,  4,  4,  5],
            [18,  9, 12, 17, 15],
            [11,  6, 14, 19, 10]
        ], [ // 7
            [10, 10, 5, 5],
            [13, 13, 19, 19],
            [3,  3, 2, 2]
        ], [ // 8
            [10,  5,  9, 18, 11],
            [13, 19,  6, 12, 14],
            [ 3,  2,  4,  4,  5],
            [11,  6, 14, 19, 10]
        ], [ // 9
            [85, 92, 73, 90],
            [95, 87, 78, 95],
            [82, 83, 79, 90],
            [86, 90, 80, 88]
        ], [ // 10
            [4, 8,  7, 15, 12],
            [7, 9, 17, 14, 10],
            [6, 9, 12,  8,  7],
            [6, 7, 14,  6, 10],
            [6, 9, 12, 10,  6]
        ], [ // 11
            [ 2, 10,  9],
            [15,  4, 14],
            [13, 14, 16],
            [ 4, 15, 13]
        ], [ // 12
            [4, 8,  7, 15, 12],
            [7, 9, 17, 14, 10],
            [6, 9, 12,  8,  7]
        ], [ // 13
            [ 1746, 1808, 1795, 1729, 1797, 1458, 1639, 1482, 1507, 1538, 1466, 1815, 1866, 1831, 1739, 1763, 1838, 1799, 1473, 1704],
            [ 1758, 1834, 1695, 1570, 1683, 1580, 1666, 1539, 1551, 1637, 1526, 1696, 1686, 1641, 1651, 1662, 1607, 1833, 1507, 1801],
            [ 1592, 1604, 1511, 1359, 1506, 1325, 1418, 1330, 1346, 1358, 1281, 1488, 1468, 1438, 1485, 1451, 1374, 1588, 1300, 1549],
            [ 1493, 1567, 1453, 1376, 1500, 1324, 1389, 1315, 1304, 1372, 1317, 1563, 1444, 1425, 1413, 1492, 1441, 1555, 1277, 1509],
            [ 1631, 1766, 1565, 1504, 1612, 1463, 1500, 1453, 1472, 1504, 1454, 1545, 1625, 1653, 1648, 1598, 1534, 1828, 1404, 1800],
            [ 1796, 1893, 1712, 1601, 1732, 1450, 1555, 1420, 1495, 1392, 1402, 1698, 1762, 1618, 1702, 1690, 1673, 1894, 1416, 1854],
            [ 1317, 1283, 1290, 1168, 1269, 1260, 1338, 1236, 1250, 1265, 1170, 1266, 1270, 1196, 1210, 1231, 1198, 1277, 1212, 1268],
            [ 1665, 1714, 1625, 1623, 1761, 1638, 1650, 1629, 1605, 1717, 1593, 1678, 1714, 1707, 1606, 1661, 1744, 1786, 1567, 1799],
            [  900,  933,  923,  895,  961,  849,  853,  848,  838,  901,  853,  939,  949,  907,  873,  912,  953,  958,  815,  972],
            [  767,  786,  822,  774,  825,  816,  808,  881,  824,  959,  890,  787,  822,  783,  751,  786,  829,  845,  804,  842],
            [ 1870, 1912, 1843, 1778, 1916, 1755, 1810, 1830, 1775, 1920, 1823, 1884, 1904, 1815, 1763, 1843, 1890, 1950, 1743, 1932],
            [ 1540, 1625, 1503, 1534, 1660, 1498, 1501, 1501, 1451, 1554, 1500, 1562, 1617, 1606, 1514, 1556, 1640, 1674, 1452, 1704],
            [ 1899, 1922, 1814, 1651, 1719, 1721, 1767, 1639, 1635, 1777, 1634, 1832, 1700, 1705, 1727, 1721, 1698, 1934, 1597, 1888],
            [ 1333, 1356, 1323, 1217, 1298, 1288, 1392, 1343, 1298, 1454, 1334, 1357, 1344, 1231, 1242, 1263, 1230, 1336, 1285, 1341],
            [ 1058, 1116, 1003,  938,  935,  914,  970,  930,  907,  995,  926,  989,  922,  995,  993,  976,  967, 1120,  908, 1113],
            [  435,  434,  430,  434,  463,  447,  445,  453,  424,  489,  455,  451,  459,  440,  421,  431,  447,  459,  429,  459],
            [  381,  389,  371,  377,  418,  452,  405,  474,  422,  515,  480,  378,  382,  400,  380,  372,  419,  458,  427,  436],
            [  676,  685,  668,  737,  775,  659,  645,  680,  619,  713,  655,  711,  777,  743,  676,  709,  792,  692,  630,  771],
            [  396,  414,  388,  417,  423,  378,  388,  393,  365,  422,  386,  409,  445,  425,  396,  403,  437,  412,  376,  450]  
        ]
    ];
    
    for (var i = 0; i < 14 && matrixes.length; i++) {
        print(matrixes[i], '原矩阵：');
        
        var solutions = hungary(matrixes[i]);
        
        printOptimal(matrixes[i], solutions);
    }
}

// warn-不打印指派过程，不休眠; info-只打印指派过程; debug-打印指派过程并休眠
var level = 'warn';
// 开始测试
testHungary();