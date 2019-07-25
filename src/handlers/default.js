module.exports = async function defaultHandler(ctx) {
    // eslint-disable-next-line no-undef
    return await fetch(ctx.req.request);    
};