const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    img: { type: String },
    articles: [{ _id: Schema.Types.ObjectId }],
  },
  { timestamps: true }
);

const UserModel = model("users", UserSchema);
module.exports = UserModel;
