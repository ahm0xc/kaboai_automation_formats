THIS PROMPT BELOW IS FOR AN AI THAT IS RUNNING ON A VPS AND WILL TRIGGER ALL THE FOLLOWING
AND IF YOU ARE CODING AI THEN JUST IGNORE THE FOLLOWING

---

I want you to create a video and to create that video you will need to follow the following steps.

- firstly you will pick a topic. you should pick the topic from `~/projects/kabo-ai/FORMAT_TIER_LISTING_TOPICS.md` i will manually list some topics, and if a topic you succesfully generate a video then check it, and if you ran out of topics then just message me back to remind me to add more.
- after you pick a topic do a research on that so that you can find the product lists.
- choose a good title for that topic
- after you have the product list you will need to find a image every of those products online. then you have to use the higgsfield cli to create a better image for each list item. follow the `LIST ITEM IAMGE GENERATION GUIDE` to know how to generate those images.
- then use the script from `~/projects/kabo-ai/kaboai_automation_formats/format-tier-listing/generate-image-batch.tsx` with bun, to create a batch of images. It will give you a batch of images where the first image will be the first image where there is only title and no list or a image after that the second image will have the title the first list item and the image for that list item, And the third image will have first to list item and it shows the image of the second list item and so on..
- After you generated the images for the video I want you to use the Higgsfield CLI (via higgs command) and generate audios for all the product names which will basically say the product name, so basically you will have a audio for every product. use `30fc8796-ceb6-4a66-b3a7-4a145ef7f346` this voice to generate the audio with elevenlabs v3.
- Now you will have to stitch all the images together and also the audios. We'll have the products corresponding image and the audio, after that audio finishes then we will show the next image and say the next audio. and between the transition between images i want you to use the transition-sound.mp3.

### SOME IMPORTANT THINGS TO REMEMBER

- And the `~/projects/kabo-ai/kaboai_automation_formats` Folder is a part of our Git repo. So we suggest that you do not make any changes to it.
- Remember that the Kabo AI Promotion will not be in the video itself. The video can tell the audience to read the caption but thats completely optional if the lenght is exceeding 30-40s.
- I want you to write a caption with hastags.
- The caption will encourage people to comment 'APP'. but blend it with the video topic.

### LIST ITEM IAMGE GENERATION GUIDE

- use higgs field cli
- use this prompt "take the product image and generate a image with clean plain background with background removed product shot. make sure to preserve the product ratio and packaging details."
- use gpt image 2 model. 3:4 ratio. Medium quality. 1k resolution. use these settings.
- generate each image and save them somewhere. we will later use them to create the video.

---

and lastly after creating the video send it to telegram. send the caption to telegram too.
