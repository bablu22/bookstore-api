import db from '@config/knex';
import asyncHandler from '@middlewares/asyncHandler';
import sendResponse from '@utils/sendResponse';
import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { bookService } from './books.service';

export const getAllBooks: RequestHandler = asyncHandler(async (req, res) => {
  const results = await bookService.getBooks(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Books retrieved successfully',
    data: results.books,
    meta: results.pagination
  });
});

export const getBookById: RequestHandler = asyncHandler(async (req, res) => {
  const book = await bookService.getBook(Number(req.params.id));

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Book retrieved successfully',
    data: book
  });
});

export const createBook: RequestHandler = asyncHandler(async (req, res) => {
  const book = await bookService.createBook(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Book created successfully',
    data: book
  });
});

export const updateBook: RequestHandler = asyncHandler(async (req, res) => {
  const book = await bookService.updateBook(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Book updated successfully',
    data: book
  });
});

export const deleteBook: RequestHandler = asyncHandler(async (req, res) => {
  await bookService.deleteBook(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Book deleted successfully',
    data: null
  });
});
