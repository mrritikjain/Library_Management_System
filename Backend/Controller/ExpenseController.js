import Expense from "../models/Expense.js";

export const createExpense = async (req, res) => {
  try {
    const { title, amount, date, category, notes } = req.body;
    const createdBy = req.userID;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: "Expense title is required" });
    }
    if (amount === undefined || Number(amount) <= 0) {
      return res.status(400).json({ message: "Expense amount must be greater than zero" });
    }
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const expense = new Expense({
      title: title.trim(),
      amount: Number(amount),
      date: date || undefined,
      category,
      notes: notes ? notes.trim() : "",
      createdBy,
    });
    await expense.save();

    res.status(201).json({ success: true, message: "Expense recorded successfully", expense });
  } catch (error) {
    console.error("Error in createExpense:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const createdBy = req.userID;
    const expenses = await Expense.find({ createdBy }).sort({ date: -1 });
    res.status(200).json({ success: true, expenses });
  } catch (error) {
    console.error("Error in getExpenses:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const createdBy = req.userID;

    const expense = await Expense.findOne({ _id: id, createdBy });
    if (!expense) {
      return res.status(404).json({ message: "Expense record not found" });
    }

    await Expense.deleteOne({ _id: id, createdBy });
    res.status(200).json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error in deleteExpense:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
