"use strict";

const secret = require("../config/secret/vimeo-tokens.js");
const Vimeo = require("vimeo").Vimeo;
const VimeoInformation = require("../models/vimeoInformation.js");
const lib = new Vimeo(secret.CLIENT_ID, secret.CLIENT_SECRET, secret.ACCESS_TOKEN);

module.exports = () => {

      lib.request({ path : "/users/alanmasferrer/videos" },
        function (error, body, status_code, headers) {
          console.log("sc", status_code);
          console.log("hd", headers);
          if (error) {
            // return res.render("home", {
            //   information: "error"
            // });
            console.log(error);
          }

          let video = {};
          let videoCollection = [];
          let header = null;
          let bioHeader = null;
          let bio = null;
          let profilePicture = null;
          let embedString = null;
          let $ = null;
          let slicedEmbed = null;

          for (let i = 0; i < body.data.length; i++) {

            if (!bio) {
              bioHeader = body.data[i].user.bio.split(".")[0];
              bio = body.data[i].user.bio;
            }

            if (!header) {
              for (let j = 0; j < body.data[i].pictures.sizes.length; j++) {
                if (body.data[i].pictures.sizes[j].width >= 1280) {
                  header = body.data[i].pictures.sizes[j].link;
                }
              }
            }

            video.rowStart = false;
            video.rowEnd = false;
            video.title = body.data[i].name;
            video.embed = body.data[i].embed.html.split("id=0").join("id=0&color=242F49&title=0&byline=0&portrait=0");
            video.thumbnail = body.data[i].pictures.sizes[5].link;

            if (i % 3 === 0) {
              video.rowStart = true;
            }

            if (i % 3 === 0 && i !== 0) {
              video.rowEnd = true;
            }

            videoCollection.push(video);
            video = {};

          }

          lib.request({ path : "/users/alanmasferrer" },
            function (error, body, status_code, headers) {
              if (error) {
                // return res.render("home", {
                //   information: "error"
                // });
                console.log(error);
              }

              profilePicture = body.pictures.sizes[(body.pictures.sizes.length - 1)].link;

              VimeoInformation.findOneAndUpdate({}, new VimeoInformation({
                  information: videoCollection,
                  header: header,
                  profilePicture: profilePicture,
                  bioHeader: bioHeader,
                  bio: bio
               }), {upsert:true}, (err, account) => {
                 console.log(account);
                 console.log("Kontroll på Vimeo");
               });


            });

        });

}
