const Internship = require("../models/Internship");

exports.createInternship = (req, res) => {
  const {
    companyName,
    description,
    location,
    stipend,
    techstack,
    duration,
    lastDate,
    startDate,
    endDate,
    industry,
    stream,
    role,
    vacancies
  } = req.body;
  const user = req.user;

  if (
    !companyName ||
    !description ||
    !location ||
    !stipend ||
    !techstack ||
    !lastDate ||
    !startDate ||
    !endDate ||
    !duration ||
    !industry ||
    !stream ||
    !role ||
    !vacancies
  ) {
    return res.json({ error: "Please add all fields" });
  }

  // let techStackArray = new Array();
  const techStackArray = techstack.split(",");
  // console.log(techStackArray);
  // console.log(typeof(endDate));
  // const duration = endDate.getMonth() - startDate.getMonth();
  // console.log(duration);

  // int x = stringToDate(endDate,'/')

  const internship = new Internship({
    companyName,
    description,
    location,
    stipend,
    lastDate,
    duration,
    startDate,
    endDate,
    industry,
    stream,
    techstack: techStackArray,
    createdBy: user,
    role,
    vacancies
  });

  // console.log(internship);

  internship
    .save()
    .then((intern) => {
      res.json({ message: "Saved Succcessfully" });
    })
    .catch((err) => {
      console.log(err);
      return res.json({ error: "Something Went Wrong" });
    });
};

exports.getAllInternships = (req, res) => {
  Internship.find()
    .populate("createdBy", "_id personName")
    .sort("-createdAt")
    .then((internships) => {
      res.json({ internships: internships });
    })
    .catch((err) => {
      return res.json({ error: "Something Went Wrong" });
    });
};

exports.updateInternship = (req, res) => {
  const {
    postId,
    description,
    location,
    stipend,
    techstack,
    duration,
    lastDate,
    startDate,
    endDate,
    industry,
    stream,
    role,
    vacancies
  } = req.body;

  Internship.findById(postId)
    .then((internship) => {
      // console.log(internship);
      if (description) {
        internship.description = description;
      }
      if (location) {
        internship.location = location;
      }
      if (stipend) {
        internship.stipend = stipend;
      }
      if (techstack) {
        const techStackArray = techstack.split(",");
        internship.techstack = techStackArray;
      }
      if (duration) {
        internship.duration = duration;
      }
      if (lastDate) {
        internship.lastDate = lastDate;
      }
      if (startDate) {
        internship.startDate = startDate;
      }
      if (endDate) {
        internship.endDate = endDate;
      }
      if (industry) {
        internship.industry = industry;
      }
      if (stream) {
        internship.stream = stream;
      }
      if (role) {
        internship.role = role;
      }
      if(vacancies){
        internship.vacancies = vacancies;
      }

      internship
        .save()
        .then((intern) => {
          res.json({ message: "Internship updated sucessfully!" });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ error: "Something went wrong!" });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Something went wrong!" });
    });
};

exports.getInternshipValues = (req, res) => {
  const { postId } = req.params;
  Internship.findById(postId)
    .then((internship) => {
      if (!internship) {
        return res.status(400).json({ error: "Internship does not exists" });
      }
      res.json({ internship: internship });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Something went wrong!" });
    });
};

exports.deleteInternship = (req, res) => {
  const { postId } = req.body;

  Internship.findByIdAndDelete(postId)
    .then((deletedPost) => {
      res.json({ message: "Internship deleted successfully!" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Something went wrong!" });
    });
};

exports.searchFilterInternships = async (req, res) => {
  const match = {};
  if (req.query.location) {
    match.location = req.query.location;
  }
  if (req.query.duration) {
    match.duration = req.query.duration;
  }
  if (req.query.companyName) {
    match.companyName = req.query.companyName;
  }
  if (req.query.techstack) {
    match.techstack = { $in: req.query.techstack };
  }
  if (req.query.startDate) {
    const date = new Date(req.query.startDate).toISOString();
    match.startDate = date;
  }
  if(req.query.role){
    match.role = req.query.role 
  }
  if(req.query.vacancies){
    match.vacancies = req.query.vacancies 
  }
  try{
    const internships = await Internship.find(match);
    res.status(200).send({ internships: internships });
  } catch (e) {
    return res.status(400).send("something went wrong");
  }
  // const internship = await Internship.find({ techstack: { $in: match.techstack }, 'location': 'l2'})
};

exports.searchInternship = async (req, res) => {
  const match = { createdBy: req.user._id };
  if (req.query.stipend) {
    match.stipend = req.query.stipend;
  }
  if (req.query.techstack) {
    match.techstack = { $in: req.query.techstack };
  }
  if (req.query.duration) {
    match.duration = req.query.duration;
  }
  if (req.query.startDate) {
    const date = new Date(req.query.startDate).toISOString();
    match.startDate = date;
  }
  if(req.query.role){
    match.role = req.query.role 
  }
  if(req.query.vacancies){
    match.vacancies = req.query.vacancies 
  }
  
  try{
    const internships = await Internship.find(match).populate("createdBy", "_id personName").sort("-createdAt")
    if(internships.length===0){
      return res.status(200).send({message: "No internships found"})
    }
    res.status(200).send(internships);
    } catch (e) {
    res.status(400).send("Something went wrong");
  }
};

exports.getInternshipsByLocation = (req, res) => {
  const { location } = req.params;

  if (!location) {
    res.status(422).json({ error: "Please fill loction" });
  }

  Internship.find({ location: location })
    .populate("createdBy", "_id personName")
    .sort("-createdAt")
    .then((internships) => {
      res.json({ internships: internships });
    });
};

exports.getInternshipsByIndustry = (req, res) => {
  const { industry } = req.params;

  if (!industry) {
    res.status(422).json({ error: "Please fill loction" });
  }

  Internship.find({ industry: industry })
    .populate("createdBy", "_id personName")
    .sort("-createdAt")
    .then((internships) => {
      console.log(internships);
      res.json({ internships: internships });
    });

};

exports.getInternshipsByStream = (req, res) => {
  const { stream } = req.params;

  if (!stream) {
    res.status(422).json({ error: "Please fill loction" });
  }

  Internship.find({ stream: stream })
    .populate("createdBy", "_id personName")
    .sort("-createdAt")
    .then((internships) => {
      console.log(internships);
      res.json({ internships: internships });
    });

};

exports.bookmarkInternship = async(req, res) => {
  try{
    const bool = (req.body.bookmark === "true")
    const internship = await Internship.findById(req.params.id)
    if(bool){
      if(!internship.bookmarkedBy.includes(req.user._id)){  //making sure that a user doesn't get appended to the list more than once
        internship.bookmarkedBy.push(req.user._id)
        await internship.save()
      }
      return res.status(200).send({message: "bookmarked!"})
    }
    else{
      const i = internship.bookmarkedBy.indexOf(req.user._id)
      if(i<0){    //if user was not present in the bookmarkedBy list of internship
        return res.status(200).send({message: "internship not found!"})
      }
      internship.bookmarkedBy.splice(i, 1)
      await internship.save()   
      return res.status(200).send({message: "the internship is not included in your bookmarked list anymore!"})   
    }
  }
  catch(e){
    return res.status(400).send({message:"something went wrong"})
  }
}

exports.getBookmarkedInternships = async(req, res) => {
  try{
    const internships = await Internship.find({bookmarkedBy:req.user._id})
    const _internships = []
    internships.forEach((internship) => {
      const {techstack,
        _id,
        companyName,
        description,
        location,
        stipend, 
        lastDate,
        duration, 
        startDate, 
        endDate, 
        createdBy} = internship
      const obj = {techstack,
        _id,
        companyName,
        description,
        location,
        stipend, 
        lastDate,
        duration, 
        startDate, 
        endDate, 
        createdBy} 
      _internships.push(obj) 
    })
    return res.status(200).send(_internships)
  }
  catch(e){
    res.status(400).send('something went wrong!')
  }
}