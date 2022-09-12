const FormData = require("form-data");
const https = require("https");
const fs = require("fs");
var glob = require("glob");
const API = "https://jsonplaceholder.typicode.com/users";
//"https://fsc-cns-pipeline-pi.v1.pcf.dell.com/v1/api/chassis/refresh/loadFromExcel?eventType=chassis_refreshed&sheeName=ALL&publishTo=ALL&ispintPoint=FALSE";

// options is optional
glob("**/*.xlsx", function (er, files) {
  if (files.length > 0) {
    files.forEach((file) => {
      const path = `${__dirname}/${file}`;
      sendFileToAPI(path);
    });
  } else {
    console.log("No xlsx sheet found");
  }
});

const sendFileToAPI = (file) => {
  const readStream = fs.createReadStream(file);
  console.log("Processing > ", file);
  const form = new FormData();
  form.append("file", readStream);
  form.append(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  https
    .get(
      API,
      { headers: form.getHeaders() },
      (res) => {
        let data = [];
        res.on("data", (chunk) => {
          data.push(chunk);
        });

        res.on("end", () => {
          console.log("Response ended: ", data);
          const users = JSON.parse(Buffer.concat(data).toString());

          console.log(users)
          fs.writeFileSync(`${file.replace(".xlsx","")}.json`, JSON.stringify(users));
        });
      }
    )
    .on("error", (err) => {
      console.log("Error: ", err.message);
    });
};
