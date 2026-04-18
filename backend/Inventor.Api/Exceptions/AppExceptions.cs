using System;
using System.Net;

namespace Inventor.Api.Exceptions
{
    public abstract class AppException : Exception
    {
        public HttpStatusCode StatusCode { get; }

        protected AppException(string message, HttpStatusCode statusCode = HttpStatusCode.InternalServerError)
            : base(message)
        {
            StatusCode = statusCode;
        }
    }

    public class NotFoundException : AppException
    {
        public NotFoundException(string message) 
            : base(message, HttpStatusCode.NotFound) { }
    }

    public class BadRequestException : AppException
    {
        public BadRequestException(string message) 
            : base(message, HttpStatusCode.BadRequest) { }
    }

    public class ConflictException : AppException
    {
        public ConflictException(string message) 
            : base(message, HttpStatusCode.Conflict) { }
    }

    public class UnauthorizedException : AppException
    {
        public UnauthorizedException(string message) 
            : base(message, HttpStatusCode.Unauthorized) { }
    }

    public class ForbiddenException : AppException
    {
        public ForbiddenException(string message) 
            : base(message, HttpStatusCode.Forbidden) { }
    }
}
