const { body } = require("express-validator");
import type { ValidationChain } from "express-validator";
import type { Request } from "express";

const createExamValidator: ValidationChain[] = [
  body("course_id")
    .notEmpty()
    .withMessage("course_id is required")
    .isInt({ min: 1 })
    .withMessage("course_id must be an integer"),
  body("title")
    .notEmpty()
    .withMessage("title is required")
    .isString()
    .withMessage("title must be text"),
  body("description")
    .optional()
    .isString()
    .withMessage("description must be text"),
  body("duration")
    .notEmpty()
    .withMessage("duration is required")
    .isInt({ min: 1 })
    .withMessage("duration must be an integer in minutes"),
  body("start_time")
    .notEmpty()
    .withMessage("start_time is required")
    .isISO8601()
    .withMessage("format start_time is (YYYY-MM-DD HH:mm:ss)")
    .custom((value: any) => {
      if (new Date(value) <= new Date())
        throw new Error("start_time cannot be in the past");

      return true;
    }),
  body("end_time")
    .notEmpty()
    .withMessage("end_time is required")
    .isISO8601()
    .withMessage("format end_time is (YYYY-MM-DD HH:mm:ss)")
    .custom((value: any, { req }: { req: Request }) => {
      if (new Date(value) <= new Date(req.body.start_time))
        throw new Error("end_time must be after the start time");

      return true;
    }),
];

const updateExamValidator: ValidationChain[] = [
  body("course_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("course_id must be an integer"),
  body("title")
    .optional()
    .notEmpty()
    .withMessage("title is required")
    .isString()
    .withMessage("title must be text"),
  body("description")
    .optional()
    .isString()
    .withMessage("description must be text"),
  body("duration")
    .optional()
    .isInt({ min: 1 })
    .withMessage("duration must be an integer in minutes"),
  body("start_time")
    .optional()
    .isISO8601()
    .withMessage("format start_time is (YYYY-MM-DD HH:mm:ss)")
    .custom((value: any) => {
      if (new Date(value) <= new Date())
        throw new Error("start_time cannot be in the past");

      return true;
    }),
  body("end_time")
    .optional()
    .isISO8601()
    .withMessage("format end_time is (YYYY-MM-DD HH:mm:ss)")
    .custom((value: any, { req }: { req: Request }) => {
      if (
        req.body.start_time &&
        new Date(value) <= new Date(req.body.start_time)
      )
        throw new Error("end_time must be after the start time");

      return true;
    }),
];

const assignQuestionsValidator: ValidationChain[] = [
  body("question_ids")
    .notEmpty()
    .withMessage("question_ids is required")
    .isArray({ min: 1 })
    .withMessage("question_ids must be a non-empty array")
    .custom((value: any) => {
      // Pastikan semua isi array adalah angka (ID valid)
      if (!value.every(Number.isInteger)) {
        throw new Error("All items in question_ids must be integers");
      }
      return true;
    }),
];

module.exports = {
  createExamValidator,
  updateExamValidator,
  assignQuestionsValidator,
};
