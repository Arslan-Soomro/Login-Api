const objsPropToArray = (arr, prop) => {
  const newArr = [];
  arr.forEach((item) => {
    newArr.push(item[prop]);
  });
  return newArr;
};

const encodeData = (data) => {
  let newData = "";
  for (let i = 0; i < data.length; i++) {
    newData += data.charCodeAt(i) + 2; //Converting String Into UTF Numbers And Adding 2 For More Secutity
    if (!(i + 1 >= data.length)) {
      newData += 126; //126 Is Divider Between MeaningFul Data Or We Can Say Identifier
    }
  }

  return newData;
};

const decodeData = (data) => {
  let chunksOfData = [];
  let chunk = "";
  for (let i = 0; i < data.length; i++) {
    chunk += data[i]; //Filling Chunk With MeaningFul Data
    if (
      (data[i + 1] === "1" && data[i + 2] === "2" && data[i + 3] === "6") ||
      i + 1 >= data.length
    ) {
      //If We Identify 126 We Avoid It
      i += 3;
      chunksOfData.push(parseInt(chunk)); //Add Chunk As An Integer
      chunk = ""; //Reset Value Of Chunk
    }
  }
  chunksOfData = chunksOfData.map((item) => String.fromCharCode(item - 2)); //New Array With MeaningFul Data
  return chunksOfData.join(""); //Converting Array Into String Afterwards Returning It
};

const generateToken = (tokensArr) => {
  const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let token = '';
  while(true){
    for(let i = 0; i < 8; i++){
      token += alphabet[Math.floor(Math.random()*36)];
    }
    if(!tokensArr.includes(token)){
      break;
    }
  }
  return token;
}

module.exports.objsPropToArray = objsPropToArray;
module.exports.encode = encodeData;
module.exports.decode = decodeData;
