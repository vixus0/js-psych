var clicktype = 'click';
if (document.ontouchstart) clicktype = 'touchstart';

////
// Utils
//

function getId(id) {
  return document.getElementById(id);
}

function randInt(a, b) {
  return Math.floor((b-a+1) * Math.random() + a);
}

function randInts(n, a, b, init) {
  var list = [init];
  for (var i=0; i<n; i++) {
    var num = randInt(a,b);
    while (num == list[list.length - 1] || num == list[0]) {
      num = randInt(a,b);
    }
    list.push(num);
  }
  return list;
}

function Results(cols) {
  var cols = cols;
  var list = [];

  this.addResult = function(result) {
    if (result.length == cols.length) {
      var res = new Object();
      for (var i=0; i<cols.length; i++) {
        res[cols[i]] = result[i];
      }
      list.push(res);
    }
  };

  this.renderHTML = function() {
    var len = list.length;
    var nc = cols.length;

    out = "<table><thead><tr><td>#</td>";
    for (var i=0; i<nc; i++) {
      out += "<td>"+cols[i]+"</td>";
    }
    out += "</tr></thead><tbody>";
    for (var i=0; i<len; i++) {
      out += "<tr><td>"+(i+1)+"</td>";
      for (var j in list[i]) {
        out += "<td>"+list[i][j]+"</td>";
      }
      out += "</tr>";
    }
    out += "</tbody></table>";
    return out;
  };
}

////
// Question Sets
//

function MathQSet(timer, numq) {
  var self = this;

  var nChoices = 4;
  var maxNum = 10;

  var timer = timer;
  var numQ = numq;
  var curQ = 1;

  var resCols = ['NumA', 'NumB', 'Choices', 'Correct', 'Chose', 'Response'];
  var results = new Results(resCols);
  var lastres = [];

  var q_div, a_div;

  this.answerQuestion = function(choice) {
    lastres[4] = choice.answer_id + 1;
    lastres[5] = (timer() - lastres[5]).toFixed(2);
    results.addResult(lastres);
    if (curQ < numQ) {
      self.nextQuestion();
      curQ++;
    } else {
      this.showResults();
    } 
  };

  this.nextQuestion = function() {
    var numA = randInt(1,maxNum);
    var numB = randInt(1,maxNum);
    var answer = numA + numB;

    var correctChoice = randInt(0,nChoices-1);

    q_div.innerHTML = "Question "+curQ+"<br><br>" + numA + " + " + numB + " = ?";
    a_div.innerHTML = "";

    var choices = [];
    var rlist = randInts(nChoices, 1, maxNum*2, answer);

    for (var i=0; i<nChoices; i++) {
      a_div.appendChild( document.createElement('span') );
      var last = a_div.lastElementChild;
      last.className = 'button';
      last.answer_id = i;
      last.addEventListener(clicktype, function(){self.answerQuestion(this)}, false);;
      if (i === correctChoice) {
        last.innerHTML = ""+answer;
        choices.push(answer);
      } else {
        var thisChoice = rlist.pop();
        last.innerHTML = ""+thisChoice;
        choices.push(thisChoice);
      }
    }

    lastres = [numA, numB, choices, correctChoice+1, null, timer()];
  };

  this.showResults = function() {
    a_div.innerHTML = "";
    q_div.innerHTML = "<p>Test complete.</p><p>";
    q_div.innerHTML += results.renderHTML();
  };

  this.init = function(out_div) {
    q_div = document.createElement('div');
    a_div = document.createElement('div');
    q_div.id = "question";
    a_div.id = "answers";

    out_div.appendChild(q_div);
    out_div.appendChild(a_div);
    out_div.style.display = 'block';

    self.nextQuestion();
  };

}

function PosQSet(timer) {

}


////
// Main
//

function startTest() {
  var numQ = parseInt( getId('numq').value );
  var testType = getId('test_type').value;

  // Timestamping
  if (window.performance) {
    if (window.performance.now) {
      getTime = function() { return window.performance.now(); };
    } else if (window.performance.webkitNow) {
        getTime = function() { return window.performance.webkitNow(); };
    } 
  } else {
    getTime = function() { return new Date().getTime(); };
  }

  // Init
  var qSet = null;
  switch(testType) {
    case 'math':
      qSet = new MathQSet(getTime, numQ);
      break;
    case 'position':
      qSet = new PosQSet(getTime, numQ);
      break;
  }

  getId('params').style.display = 'none';
  divTest = getId('testbed');

  qSet.init(divTest);
}

getId('start_test').addEventListener(clicktype, startTest, false);
