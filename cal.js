// Définition des valeurs de départ des variables

var NDIGITS = 16;
var STACKSIZE = 12;

var value = 0;
var level = 0;
var entered = true;
var decimal = 0;
var fixe = 0;
var exponent = false;



// L'ouverture d'une parenthèses suppose une pile, 
// appelée Stack, dans laquelle les éléments individuels sont enregistrés.
// Ces éléments sont appelés Items.
function stackItem()
{
 this.value = 0;
 this.op = "";
}

// Cette fonction constructeur sert de modèle pour la pile.
function array(length)
{
  this[0] = 0;
  for (i=0; i<length; ++i)
  {
  this[i] = 0;
  this[i] = new stackItem();
  }
  this.length = length;
}
stack = new array(STACKSIZE);

// Ajout de nouveaux éléments à la pile
function pousser(value,op,prec)
{
  if (level==STACKSIZE)
         return false;
  for (i=level;i>0; --i)
  {
  stack[i].value = stack[i-1].value;
  stack[i].op = stack[i-1].op;
  stack[i].prec = stack[i-1].prec;
  }
  stack[0].value = value;
  stack[0].op = op;
  stack[0].prec = prec;
  ++level;
  return true;
}

// Lire le dernier élément de la pile
function entrer()
{
  if (level==0)
  return false;
  for (i=0;i<level; ++i)
  {
  stack[i].value = stack[i+1].value;
  stack[i].op = stack[i+1].op;
  stack[i].prec = stack[i+1].prec;
  }
  --level;
  return true;
}

// Mise en forme de la valeur à afficher
function format(value)
{
  // valStr contient la valeur actuelle de value,
  // Mais subit au préalable une conversion
  // en chaîne de caractères.
  var valStr = "" + value;

  // Si value contient la valeur spéciale "Not a Number"
  // (cad si value n'est pas un nombre valide), l'affichage
  // ne peut être formaté
  if (valStr.indexOf("N")>=0 ||
  (value == 2*value && value == 1+value))
  return "Error ";

  // Lors de la conversion de value en chaîne de caractères, l'objet Number
  // sépare les valeurs normales des puissances de 10par un "e".
  // Dans notre affichage, nous utilisons exclusivement des espaces simples.
  var i = valStr.indexOf("e")
  if (i>=0)
  {
  // Dans valStr un "e" a été trouvé. L'exposant
  // (la partie derrière "e" est enregistré dans expStr et
  // supprimé dans valStr.
  var expStr = valStr.substring(i+1,valStr.length);
  if (i>NDIGITS-5) i=NDIGITS-5;
  valStr = valStr.substring(0,i);
  if (valStr.indexOf(".")<0) valStr += ".";
  // L'exposant est à n ouveau ajouté derrière la valeur,
  // séparé par un espace.
  valStr += " " + expStr;
  } else {
  // value ne contient pas de "e" et donc pas d'exposant
  var valNeg = false;
  if (value < 0) { value = -value; valNeg = true; }
  // Le logarithme, indique le nombre de position de value.
  var expval = Math.log(value)*Math.LOG10E;
  if (value == 0) {
      expval = 0;
  // Si value ne tient plus dans l'affichage, la partie arrière
  // et coupée et remplacée par une puissance de 10
  } else if (expval > NDIGITS-5) {
      expval = Math.floor(expval);
      value /= Math.pow(10, expval);
  } else if (-expval > NDIGITS-5) {
      expval = Math.ceil(expval);
      value /= Math.pow(10, expval);
  } else {
      expval = 0;
  }
  var valInt = Math.floor(value);
  var valFrac = value - valInt;
  var prec = NDIGITS - (""+valInt).length - 1;
  if (prec < 0) return "Error"
  if (! entered && fixe>0)
      prec = fixe;
  var mult = " 1000000000000000000".substring(1,prec+2);
  var frac = Math.floor(valFrac * mult + 0.5);
  valInt = Math.floor(Math.floor(value * mult + .5) / mult);
  if (valNeg)
      valStr = "-" + valInt;
  else
      valStr = "" + valInt;
  var fracStr = "00000000000000"+frac;
  fracStr =
   fracStr.substring(fracStr.length-prec, fracStr.length);
  i = fracStr.length-1;
  if (entered || fixe==0)
  {
      while (i>=0 && fracStr.charAt(i)=="0")
       --i;
      fracStr = fracStr.substring(0,i+1);
  }
  if (i>=0) valStr += "." + fracStr;
  if (expval != 0) {
      var expStr = "" + expval;
      valStr += " " + expStr;
  }
  }
  return valStr;
}


// Cette fonction écrit la valeur actuelle dans l'affichage
function refresh()
{
  var display = format(value);

  // Si la calculatrice est paramétrée sur la saisie en exposant,
  // cet exposant doit être affiché
  if (exponent)
  {
  if (expval<0)
       display += " " + expval;
  else
       display += " +" + expval;
  }

  // Si la valeur actuelle n'a pas de décimale et si 
  // aucune erreur n'est survenue, un pojnt doit être ajouté
  if (display.indexOf(".")<0 && display != "Error ")
  {
  if (entered || decimal>0)
      display += '.';
  else
      display += ' ';
  }
  // La partie gauche de l'affichage est remplie avec des espaces
  display = "             " + display;
  display =
   display.substring(display.length-NDIGITS-1,display.length);
  // La valeur est écrite dans l'affichage
  document.calculator.result.value = display;
}


// La touche C efface la valeur affichée
function clearDisp()
{
  exponent = false;
  value = 0;
  enter();
  refresh();
}

// CE place le nombre de parenthèses sur 0
function clearAll()
{
  level = 0;
  clearDisp();
}


// A cet endroit, les calculs effectifs
// sont réalisés
function evalx()
{
  if (level==0)
  return false;
  op = stack[0].op;
  sval = stack[0].value;
  if (op == "+")
  value = sval + value;
  else if (op == '-')
  value = sval - value;
  else if (op == '*')
  value = sval * value;
  else if (op == '/')
  value = sval / value;
  else if (op == 'pow')
  value = Math.pow(sval,value);
  else if(op == 'n-eme')
  value=Math.pow(sval,1/value);
  else if(op == 'Mod')
  {
  while(sval>=value) sval=sval-value;
  value=sval;
  }
  entrer();
  if (op=='(')
  return false;
  return true;
}

// openp ouvre une parenthèse
function openp()
{
  enter();
  if (!pousser(0,'(',0))
  value = "NAN";
  refresh();
}

// closep ferme la parenthèse
function closep()
{
  enter();
  while (evalx()) ;
  refresh();
}

// Cette fonction est exécutée, si un des boutons d'opération
// est activé, par exemple "+".
function operator(op)
{
  enter();
  if (op=='+' || op=='-')
  prec = 1;
  else if (op=='*' || op=='/' || op=='Mod' || op=='n-eme')
  prec = 2;
  else if (op=="pow")
  prec = 3;
  if (level>0 && prec <= stack[0].prec)
   evalx();
  if (!pousser(value,op,prec))
  value = "NAN";
  refresh();
}

// Lorsque l'utilisateur a terminé la saisie d'un nombre,
// quelques variables sont à modifier.
// Si une puissance de 10 est spécifiée, la valeur
// actuelle doit être calculée dans value
function enter()
{
  if (exponent)
  value = value * Math.exp(expval * Math.LN10);
  entered = true;
  exponent = false;
  decimal = 0;
  fixe = 0;
}

// Si l'utilisateur appuie sur la touche Entrée (appelée aussi "=")
// le calcul est effectué et la valeur est affichée
function equals()
{
  enter()
  while (level>0)
  evalx();
  refresh();
}

// digit() est appelé, si un chiffre est activé.
function digit(n)
{
  
  if (entered)
  {
  value = 0;
  digits = 0;
  entered = false;
  }
  if (n==0 && digits==0)
  {
  refresh();
  return;
  }
  if (exponent)
  {
  if (expval<0)
       n = -n;
  if (digits < 3)
  {
      expval = expval * 10 + n;
      ++digits;
      refresh();
  }
  return;
  }
  if (value<0)
  n = -n;
  if (digits < NDIGITS-1)
  {
  ++digits;
  if (decimal>0)
   {
   decimal = decimal * 10;
   value = value + (n/decimal);
   ++fixe;
   }
   else
   value = value * 10 + n;
  }
  refresh();
}

// bksp (en anglais backspace) signifie une action sur la touche  "<-"
// La dernière saisie doit être effacée.
function bksp()
{
  if (entered)
  {
  refresh();
  return;
  }
  if (digits==0)
  {
  refresh();
  return;
  }
  if (exponent)
  {
  if (expval<0)
      expval = -Math.floor(-expval/10);
  else
      expval = Math.floor(expval/10);
  --digits;
  refresh();
   return;
  }
  if (decimal>1)
  {
  if (value<0)
      value = -Math.floor(-value*decimal/10);
  else
      value = Math.floor(value*decimal/10);
  decimal = decimal / 10;
  value = value/decimal;
  --fixe;
  if (decimal == 1)
      decimal = 0;
  }
  else
  {
  if (value<0)
      value = -Math.floor(-value/10);
  else
      value = Math.floor(value/10);
  decimal = 0;
  }
  --digits;
  refresh();
}

// La touche +/- inverse la valeur ou 
// l'exposant (plus devient moins et vice versa).
function sign()
{
  if (exponent)
  expval = -expval;
  else
  value = -value;
  refresh();
}

// period (le point en anglais) est appelé, si l'utilisateur
// souhaite spécifier une valeur décimale.
function period()
{
  if (entered)
  {
  value = 0;
  digits = 1;
  }
  entered = false;
  if (decimal == 0)
  decimal = 1;
  refresh();
}

// L'activation de la touche "x * 10^y" paramète la calculatrice
// sur la saisie en exposant.
function exp()
{
  if (entered || exponent)
  return;
  exponent = true;
  expval = 0;
  digits = 0;
  decimal = 0;
  refresh();
}


// func() ffectue les fonctions mathématiques telles que sin, cos, tan
// etc. L'argument est la fonction à exécuter.
function func(f)
{
  enter();

  if (f=="x^3")
  {
  value =value*value*value;
  }
  else if (f=="Int")
  {
  value =parseInt(value);
  }
  else if (f=="1/x")
  {
  value = 1/value;
  }
  else if (f=='n!')
  {
  if (value<0 || value>200 || value != Math.round(value))
      value = "NAN";
  else
  {
      var n = 1;
      var i;
      for (i=1;i<=value;++i)
        n *= i;
      value = n;
  }
  }
  else
  {
  // La plupart des fonction est livrée par l'objet Math
  // de JavaScript.
  if (f=="sin")
      value = Math.sin(value/180 * Math.PI);
  else if (f=="cos")
      value = Math.cos(value/180 * Math.PI);
  else if (f=="tan")
      value = Math.tan(value/180 * Math.PI);
  else if (f=="log")
      value = Math.log(value)/Math.LN10;
  else if (f=="log2")
      value = Math.log(value)/Math.LN2;
  else if (f=="ln")
      value = Math.log(value);
  else if (f=="sqrt")
      value = Math.sqrt(value);
  else if (f=="pi")
      value = Math.PI;
  else if (f=="asin")
      value = Math.asin(value)*180/Math.PI;
  else if (f=="acos")
      value = Math.acos(value)*180/Math.PI;
  else if (f=="atan")
      value = Math.atan(value)*180/Math.PI;
  else if (f=="alog")
      value = Math.exp(value * Math.LN10);
  else if (f=="alog2")
      value = Math.exp(value * Math.LN2);
  else if (f=="exp")
      value = Math.exp(value);
  else if (f=="sqr")
      value = value*value;
  else if (f=="e")
      value = Math.E;
  else if (f=="pow")
      value = Math.pow(value,1/3);
  
  }

  // Affichage le résultat du calcul
  refresh();
}

