import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    category: { type: String, required: true },
    price: { type: Number, required: true },
    referenceCode: {
      type: String,
      required: true,
      unique: true,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

ProductSchema.pre("save", async function (next) {
  if (!this.referenceCode) {
    const latestProduct =
      await this.constructor.findOne(
        {},
        {},
        { sort: { referenceCode: -1 } }
      );
    let latestNumber = 0;
    if (
      latestProduct &&
      latestProduct.referenceCode
    ) {
      latestNumber = parseInt(
        latestProduct.referenceCode.slice(2),
        10
      );
    }
    this.referenceCode = `AB${(latestNumber + 1)
      .toString()
      .padStart(2, "0")}`;
  }
  next();
});

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
