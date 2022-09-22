const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => {
        return sum + blog.likes
    }, 0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
        return null
    } else {
        const maxLikes = Math.max(...blogs.map(blog => blog.likes))
        const favoriteBlog = blogs.find(blog => blog.likes === maxLikes)
        return {
            title: favoriteBlog.title,
            author: favoriteBlog.author,
            likes: favoriteBlog.likes
        }
    }
}

const mostBlogs = (blogs) => {
    
}

module.exports = {
    dummy, totalLikes, favoriteBlog
}