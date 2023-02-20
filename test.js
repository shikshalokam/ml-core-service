let name = "సుబాష్ చంద్రస్వామి మాచిరాజు(ವರದಿಗಾರ from the रिपोर्टर),Senior QA engineer(ஆய்வாளர்,digital marketing,BBC ವರದಿಗಾರ)"

let split = name.split(",")

let Name = split.shift()
let Designation = split.reduce((acc,cuu) => acc + "," + cuu)
let newData = Name + "\n" + Designation
console.log(newData, Name, Designation)
