var MAIN_PIC_PREFIX_PATH = 'https://kascdn.kascend.com/jellyfish/uiupload';
function escapeString(value) {
  value = value + "";
  var RexStr = /\</g;
  var step1 = value.replace(RexStr, '&lt;');
  var RexStr2 = /\>/g;
  var step2 = step1.replace(RexStr2, '&gt;');
  var RexStr3 = /\"/g;
  var step3 = step2.replace(RexStr3, '&quot;');
  var RexStr4 = /\'/g;
  var step4 = step3.replace(RexStr4, '&#39;');
  return step4;
}
function formateNumber(value) {
  var num = parseInt(value);
  if (num >= 10000 && num < 100000000) {
    var snum = (num / 10000).toFixed(1);
    // alert(snum);
    return snum + '万';
  } else if (num >= 100000000) {
    var snum = (num / 100000000).toFixed(1);
    return snum + '亿';
  } else {
    return num;
  }
};