function solve(){
    console.log("test");
}
function add(a,b){
    return a+b;
}
var number = "abcd";
console.log(number);
let num= 9; 
const p=32;
console.log(number[3]);
// to find size of string do number.length;
//array
var Arr=["Abc",32];
console.log(Arr);
Arr.push([33,"test"]);
console.log(Arr);
Arr[2].shift();
Arr[2].unshift(21);
console.log(Arr);
Arr[2].pop();
console.log(Arr);
Arr.pop();
console.log(Arr);
solve();
console.log(add(1,2));
var fl=true;
if(fl)console.log("True");
else console.log("False");
fl2=23;
var ans="";
switch(fl2){
    case 1:
        ans="alpha";
        break;
    case 2:
        ans="beta";
        break;
    default:
        ans="gamma";
        break;
}
console.log(ans);

//objects
var objj={
    "name":"Abc",
    "legs":1
};

var box=objj.legs;
console.log(box);
objj.legs="changeds2"
var box2=objj.legs;
console.log(box2);
console.log(objj)
objj["hands"]="new";
console.log(objj);
delete objj.hands;
console.log(objj);

var Arr2=[];
var i=0;
while(i<5){
    Arr2.push(i);
    i++;
}
console.log(Arr2);

for(var i2=0;i2<5;i2++){
    console.log(i2);
}
var i3=0;
do{
    i3++;
    console.log(i3);
}while(i3<5)

var rec=[
    {
        "fname":"A",
        "lname":"B",
        "num":1234,
        "likes":[1,2,3]
    },
    {
        "fname":"A2",
        "lname":"B2",
        "num":12342,
        "likes":[1,2,32]
    },
    {
        "fname":"A3",
        "lname":"B3",
        "num":12343,
        "likes":[1,2,33]
    },
];
console.log("==")
var ans=(name,prop)=>
    {for(var i4=0;i4<rec.length;i4++){
        if(rec[i4].fname===name){
            return rec[i4][prop];
        }
    }};


console.log(ans("A3","lname"));