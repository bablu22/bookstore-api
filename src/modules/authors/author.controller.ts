import asyncHandler from '@middlewares/asyncHandler';
import sendResponse from '@utils/sendResponse';
import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { authorService } from './author.service';

export const getAllAuthors: RequestHandler = asyncHandler(async (req, res) => {
  const results = await authorService.getAuthors(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Authors retrieved successfully',
    data: results.authors,
    meta: results.pagination
  });
});

export const getAuthorById: RequestHandler = asyncHandler(async (req, res) => {
  const author = await authorService.getAuthor(Number(req.params.id));

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Author retrieved successfully',
    data: author
  });
});

export const createAuthor: RequestHandler = asyncHandler(async (req, res) => {
  const author = await authorService.createAuthor(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Author created successfully',
    data: author
  });
});

export const updateAuthor: RequestHandler = asyncHandler(async (req, res) => {
  const author = await authorService.updateAuthor(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Author updated successfully',
    data: author
  });
});

export const deleteAuthor: RequestHandler = asyncHandler(async (req, res) => {
  await authorService.deleteAuthor(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Author deleted successfully',
    data: null
  });
});
