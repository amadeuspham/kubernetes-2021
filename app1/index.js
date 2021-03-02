const randomHash = Math.random().toString(36).substr(2, 6)

const printHash = () => {
  var d = new Date();
  var n = d.toString();
  console.log(n + ": ", randomHash)

  setTimeout(printHash, 5000)
}

printHash()