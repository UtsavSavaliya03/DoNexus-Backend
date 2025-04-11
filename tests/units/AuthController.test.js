const { signup, login } = require('../../Controllers/Auth/authController.js');
const User = require('../../Models/User/User.js');
const bcrypt = require('bcrypt');
const { signupSchema, loginSchema } = require('../../Helpers/validator.js');
const jwt = require('jsonwebtoken');

jest.mock('../../Models/User/User');
jest.mock('bcrypt');
jest.mock('../../Helpers/validator');
jest.mock('jsonwebtoken');

describe('Auth Signup Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {
                fName: 'John',
                lName: 'Doe',
                email: 'john@example.com',
                password: 'Test1234',
            },
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        next = jest.fn();
    });

    it('should return 400 if user already exists', async () => {
        signupSchema.validateAsync.mockResolvedValue(req.body);
        User.findOne.mockResolvedValue({ email: req.body.email });

        await signup(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            status: false,
            message: 'User already exist with this email.',
        });
    });

    it('should create a new user and return 201', async () => {
        signupSchema.validateAsync.mockResolvedValue(req.body);
        User.findOne.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue('hashedPassword');
        User.create.mockResolvedValue({});

        await signup(req, res, next);

        expect(bcrypt.hash).toHaveBeenCalledWith(req.body.password, 10);
        expect(User.create).toHaveBeenCalledWith({
            fName: 'John',
            lName: 'Doe',
            email: 'john@example.com',
            password: 'hashedPassword',
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            status: true,
            message: 'User registered successfully.',
        });
    });

    it('should handle Joi validation error', async () => {
        const error = {
            isJoi: true,
            details: [{ message: 'Validation error' }],
        };
        signupSchema.validateAsync.mockRejectedValue(error);

        await signup(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            status: false,
            message: 'Validation error',
        });
    });

    it('should call next for unknown error', async () => {
        const error = new Error('Something went wrong');
        signupSchema.validateAsync.mockRejectedValue(error);

        await signup(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

describe('Auth Login Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {
                email: 'john@example.com',
                password: 'Test1234',
            },
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        next = jest.fn();
    });

    it('should return 400 if user does not exist', async () => {
        loginSchema.validateAsync.mockResolvedValue(req.body);
        User.findOne.mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
        });

        await login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            status: false,
            message: 'User does not exist with this details.',
        });
    });

    it('should return 400 if password does not match', async () => {
        loginSchema.validateAsync.mockResolvedValue(req.body);
        const mockUser = { email: 'john@example.com', password: 'hashedPassword' };

        User.findOne.mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockUser),
        });

        bcrypt.compare.mockImplementation((password, hash, cb) => cb(null, false));

        await login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            status: false,
            message: 'Password does not match.',
        });
    });

    it('should return 200 and token if credentials are valid', async () => {
        loginSchema.validateAsync.mockResolvedValue(req.body);
        const mockUser = { email: 'john@example.com', password: 'hashedPassword' };

        User.findOne.mockReturnValue({
            exec: jest.fn().mockResolvedValue({ ...mockUser }),
        });

        bcrypt.compare.mockImplementation((password, hash, cb) => cb(null, true));
        jwt.sign.mockReturnValue('mocked_token');

        await login(req, res, next);

        expect(jwt.sign).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            status: true,
            message: 'Login successful.',
            token: 'mocked_token',
            data: expect.objectContaining({ email: 'john@example.com' }),
        });
    });

    it('should return 422 on Joi validation error', async () => {
        const error = {
            isJoi: true,
            details: [{ message: 'Validation failed' }],
        };
        loginSchema.validateAsync.mockRejectedValue(error);

        await login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            status: false,
            message: 'Validation failed',
        });
    });

    it('should handle DB error and return 400', async () => {
        loginSchema.validateAsync.mockResolvedValue(req.body);
        User.findOne.mockReturnValue({
            exec: jest.fn().mockRejectedValue(new Error('DB error')),
        });

        await login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            status: false,
            message: 'Something went wrong, Please try again latter.',
        });
    });
});