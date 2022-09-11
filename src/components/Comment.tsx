import Image from 'next/image';
import { FormEvent, useState } from 'react';
// import { number } from "zod";
type comment = {
  id: string;
  authorId: string;
  replyingTo: string | null;
  upvotes: number;
  author: string;
  date: string;
  content: string;
  avatar: string;
  isReply?: boolean;
  hasReplies?: boolean;
};
type clickedType = 'upvote' | 'downvote' | false;
type InitialScoreState = { upvotes: number; clicked: clickedType };
function Comment({
  showReply,
  setShowReply,
  showEdit,
  setShowEdit,
  id,
  authorId,
  user,
  replyingTo,
  comments,
  setComments,
  isReply = false,
  hasReplies = false,
  upvotes = 12,
  author = 'amyrobson',
  date = '1 month ago',
  content = " Impressive! Though it seems the drag feature could be improved. But overall it looks incredible. You've nailed the design and the responsiveness at various breakpoints works really well.",
  avatar = '/images/avatars/image-amyrobson.png',
}: comment) {
  const initialScoreState: InitialScoreState = { upvotes, clicked: false };
  const [score, setScore] = useState(initialScoreState);
  const [changeContent, setChangeContent] = useState(content);
  const [replyContent, setReplyContent] = useState(`@${author} `);
  const handleUpvote = () => {
    if (!score.clicked) {
      setScore({ upvotes: score.upvotes + 1, clicked: 'upvote' });
      return;
    }
    if (score.clicked === 'upvote') {
      setScore({ upvotes: score.upvotes - 1, clicked: false });
      return;
    }
    if (score.clicked === 'downvote') {
      setScore({ upvotes: score.upvotes + 2, clicked: 'upvote' });
      return;
    }
  };
  const handleDownvote = () => {
    if (!score.clicked) {
      setScore({ upvotes: score.upvotes - 1, clicked: 'downvote' });
      return;
    }
    if (score.clicked === 'upvote') {
      setScore({ upvotes: score.upvotes - 2, clicked: 'downvote' });
      return;
    }
    if (score.clicked === 'downvote') {
      setScore({ upvotes: score.upvotes + 1, clicked: false });
      return;
    }
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = {
      userId: user.id,
      content: replyContent,
      replyingToId: replyingTo,
    };
    await fetch('/api/reply', {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setComments(
          comments.map((comment) => {
            if (comment.id === replyingTo) {
              return {
                ...comment,
                replies: [
                  { ...data, commenter: user, updatedAt: new Date() },
                  ...comment.replies,
                ],
              };
            }
            return comment;
          })
        );
      });
    // console.log("<<<", replyingTo);
    setShowReply('');
  };
  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = {
      userId: user.id,
      content: changeContent,
      commentId: id,
    };
    await fetch(`/api/${id}`, {
      method: 'PUT',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        console.log(replyingTo);
        if (replyingTo && replyingTo !== id) {
          setComments(
            comments.map((comment) => {
              if (comment.id === replyingTo)
                comment.replies = comment.replies.map((reply) => {
                  if (reply.id === body.commentId)
                    return { ...data, updatedAt: new Date(), commenter: user };
                  return reply;
                });
              return comment;
            })
          );
        } else {
          setComments(
            comments.map((comment) => {
              console.log(comment.id);
              console.log(data.id);
              if (comment.id === data.id) {
                console.log(data);
                return {
                  ...data,
                  updatedAt: new Date(),
                  replies: comment.replies,
                  commenter: user,
                };
              }
              return comment;
            })
          );
        }
      });
    setShowEdit('');
    // console.log("<<<", replyingTo);
  };
  const handleShowEdit = () => {
    setShowReply('');
    setShowEdit(id);
  };
  const handleDelete = async () => {
    const body = {
      userId: user.id,
      commentId: id,
    };
    await fetch(`/api/${id}`, {
      method: 'DELETE',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('deleted');
        if (replyingTo && replyingTo !== id) {
          setComments(
            comments.map((comment) => {
              if (comment.id === replyingTo) {
                const replies = comment.replies.filter(
                  (reply) => reply.id !== id
                );
                return { ...comment, replies };
              }
              return comment;
            })
          );
        } else {
          setComments(comments.filter((comment) => comment.id !== id));
        }
      });
  };
  return (
    <div
      className={`${
        isReply
          ? `w-[96%] sm:w-[95%] md:w-[94%]`
          : hasReplies
          ? 'w-[100%]'
          : 'w-[94%] sm:w-[80%] md:w-[70%] lg:w-[60%] xl:w-[40%]'
      } my-2`}
    >
      <div
        className='bg-white 
         rounded-lg flex items-start px-5 py-4 my-1'
      >
        <div className='bg-[#EAECF1] h-24  mr-4 px-[0.8rem] py-1 rounded-lg md:flex flex-col justify-evenly items-center hidden '>
          <div className=''>
            <svg
              width='11'
              height='11'
              xmlns='http://www.w3.org/2000/svg'
              onClick={handleUpvote}
            >
              <path
                className={`hover:fill-[#5457B6] ${
                  score.clicked === 'upvote' && 'fill-[#5457B6]'
                } ml-[0.1rem] cursor-pointer`}
                d='M6.33 10.896c.137 0 .255-.05.354-.149.1-.1.149-.217.149-.354V7.004h3.315c.136 0 .254-.05.354-.149.099-.1.148-.217.148-.354V5.272a.483.483 0 0 0-.148-.354.483.483 0 0 0-.354-.149H6.833V1.4a.483.483 0 0 0-.149-.354.483.483 0 0 0-.354-.149H4.915a.483.483 0 0 0-.354.149c-.1.1-.149.217-.149.354v3.37H1.08a.483.483 0 0 0-.354.15c-.1.099-.149.217-.149.353v1.23c0 .136.05.254.149.353.1.1.217.149.354.149h3.333v3.39c0 .136.05.254.15.353.098.1.216.149.353.149H6.33Z'
                fill='#C5C6EF'
              />
            </svg>
          </div>
          <div className='text-center text-sm text-[#5457B6] font-medium'>
            {score.upvotes}
          </div>
          <div className='ml-[0.1rem]'>
            <svg
              width='11'
              height='3'
              xmlns='http://www.w3.org/2000/svg'
              onClick={handleDownvote}
            >
              <path
                className={`hover:fill-[#5457B6] ${
                  score.clicked === 'downvote' && 'fill-[#5457B6]'
                } ml-[0.1rem] cursor-pointer`}
                d='M9.256 2.66c.204 0 .38-.056.53-.167.148-.11.222-.243.222-.396V.722c0-.152-.074-.284-.223-.395a.859.859 0 0 0-.53-.167H.76a.859.859 0 0 0-.53.167C.083.437.009.57.009.722v1.375c0 .153.074.285.223.396a.859.859 0 0 0 .53.167h8.495Z'
                fill='#C5C6EF'
              />
            </svg>
          </div>
        </div>
        <div className='w-full'>
          <div className='flex justify-between items-center w-full pb-3'>
            <div className='flex items-center'>
              <Image
                src={avatar}
                className='rounded-full'
                alt='profile pic'
                width='25px'
                height='25px'
              />
              <div className='font-medium px-4 text-[#324152] flex items-center justify-center'>
                {author}
                {user ? (
                  user.id === authorId && (
                    <div className='bg-[#5457B6] font-medium text-xs text-center mx-1 px-1 py-[0.05rem] rounded-sm pb-[0.12rem] text-white'>
                      you
                    </div>
                  )
                ) : (
                  <></>
                )}
              </div>
              <div className='text-[#67727E] text-sm'>{date}</div>
            </div>
            <div className='hidden md:flex justify-end items-center flex-row-reverse'>
              <button
                onClick={() => {
                  setShowEdit('');
                  if (showReply === id) setShowReply('');
                  else setShowReply(id);
                }}
                className='hover:opacity-50 flex items-center justify-center text-sm text-[#5457B6] font-medium mx-1'
              >
                <svg width='14' height='13' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M.227 4.316 5.04.16a.657.657 0 0 1 1.085.497v2.189c4.392.05 7.875.93 7.875 5.093 0 1.68-1.082 3.344-2.279 4.214-.373.272-.905-.07-.767-.51 1.24-3.964-.588-5.017-4.829-5.078v2.404c0 .566-.664.86-1.085.496L.227 5.31a.657.657 0 0 1 0-.993Z'
                    fill='#5357B6'
                  />
                </svg>
                <span className='ml-2'>Reply</span>
              </button>
              {user ? (
                user.id === authorId && (
                  <>
                    <button
                      onClick={handleShowEdit}
                      className='hover:opacity-50 flex items-center justify-center text-sm text-[#5457B6] font-medium mx-1'
                    >
                      <svg
                        width='14'
                        height='14'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          d='M13.479 2.872 11.08.474a1.75 1.75 0 0 0-2.327-.06L.879 8.287a1.75 1.75 0 0 0-.5 1.06l-.375 3.648a.875.875 0 0 0 .875.954h.078l3.65-.333c.399-.04.773-.216 1.058-.499l7.875-7.875a1.68 1.68 0 0 0-.061-2.371Zm-2.975 2.923L8.159 3.449 9.865 1.7l2.389 2.39-1.75 1.706Z'
                          fill='#5357B6'
                        />
                      </svg>
                      <span className='ml-2'>Edit</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className='hover:opacity-50 flex items-center justify-center text-sm text-[#ED6468] font-medium mx-1'
                    >
                      <svg
                        width='12'
                        height='14'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          d='M1.167 12.448c0 .854.7 1.552 1.555 1.552h6.222c.856 0 1.556-.698 1.556-1.552V3.5H1.167v8.948Zm10.5-11.281H8.75L7.773 0h-3.88l-.976 1.167H0v1.166h11.667V1.167Z'
                          fill='#ED6368'
                        />
                      </svg>
                      <span className='ml-2'>Delete</span>
                    </button>
                  </>
                )
              ) : (
                <></>
              )}
            </div>
          </div>
          {showEdit === id ? (
            <form className='flex flex-col' onSubmit={handleEditSubmit}>
              <textarea
                value={changeContent}
                onChange={(e) => setChangeContent(e.target.value)}
                id='edit'
                name='edit'
                rows={3}
                className='w-full rounded-lg border-[1px] border-[#5457B6]   px-4 py-2'
              />
              <button className='bg-[#5457B6] self-end rounded-md px-6 py-2 text-white hover:opacity-50 mt-5'>
                Update
              </button>
            </form>
          ) : (
            <div className='text-[#67727E] text-sm'>{content}</div>
          )}
          <div className='flex justify-between items-center mt-4 mb-1 md:hidden'>
            <div className='bg-[#EAECF1] w-[5.5rem]   py-[0.35rem] px-1 rounded-lg flex  justify-around items-center  '>
              <div className=''>
                <svg
                  width='11'
                  height='11'
                  xmlns='http://www.w3.org/2000/svg'
                  onClick={handleUpvote}
                >
                  <path
                    className={`hover:fill-[#5457B6] ${
                      score.clicked === 'upvote' && 'fill-[#5457B6]'
                    } ml-[0.1rem] cursor-pointer`}
                    d='M6.33 10.896c.137 0 .255-.05.354-.149.1-.1.149-.217.149-.354V7.004h3.315c.136 0 .254-.05.354-.149.099-.1.148-.217.148-.354V5.272a.483.483 0 0 0-.148-.354.483.483 0 0 0-.354-.149H6.833V1.4a.483.483 0 0 0-.149-.354.483.483 0 0 0-.354-.149H4.915a.483.483 0 0 0-.354.149c-.1.1-.149.217-.149.354v3.37H1.08a.483.483 0 0 0-.354.15c-.1.099-.149.217-.149.353v1.23c0 .136.05.254.149.353.1.1.217.149.354.149h3.333v3.39c0 .136.05.254.15.353.098.1.216.149.353.149H6.33Z'
                    fill='#C5C6EF'
                  />
                </svg>
              </div>
              <div className='text-center text-sm text-[#5457B6] font-medium'>
                {score.upvotes}
              </div>
              <div className=''>
                <svg
                  width='11'
                  height='3'
                  xmlns='http://www.w3.org/2000/svg'
                  onClick={handleDownvote}
                >
                  <path
                    className={`hover:fill-[#5457B6] ${
                      score.clicked === 'downvote' && 'fill-[#5457B6]'
                    } ml-[0.1rem] cursor-pointer`}
                    d='M9.256 2.66c.204 0 .38-.056.53-.167.148-.11.222-.243.222-.396V.722c0-.152-.074-.284-.223-.395a.859.859 0 0 0-.53-.167H.76a.859.859 0 0 0-.53.167C.083.437.009.57.009.722v1.375c0 .153.074.285.223.396a.859.859 0 0 0 .53.167h8.495Z'
                    fill='#C5C6EF'
                  />
                </svg>
              </div>
            </div>
            <div className='text-sm text-[#5457B6] font-medium '>
              <button
                onClick={() => {
                  if (showReply) setShowReply('');
                  else setShowReply(id);
                }}
                className='hover:opacity-50 flex items-center justify-center'
              >
                <svg width='14' height='13' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M.227 4.316 5.04.16a.657.657 0 0 1 1.085.497v2.189c4.392.05 7.875.93 7.875 5.093 0 1.68-1.082 3.344-2.279 4.214-.373.272-.905-.07-.767-.51 1.24-3.964-.588-5.017-4.829-5.078v2.404c0 .566-.664.86-1.085.496L.227 5.31a.657.657 0 0 1 0-.993Z'
                    fill='#5357B6'
                  />
                </svg>
                <span className='ml-2'> Reply</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {showReply === id &&
        (user ? (
          <form
            onSubmit={handleSubmit}
            className='bg-white 
         rounded-lg flex justify-evenly w-full items-start px-5 py-4 my-1'
          >
            <Image
              src={user.image}
              className='rounded-full'
              alt='profile pic'
              width='50px'
              height='50px'
            />
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              id='story'
              name='story'
              rows={3}
              className='w-[80%] rounded-lg border-[1px] border-[#5457B6] mx-4 px-4 py-2'
            />
            <label htmlFor='story'>
              <button className='bg-[#5457B6] rounded-md px-7 py-2 text-white hover:opacity-50'>
                Send
              </button>
            </label>
          </form>
        ) : (
          'You need to login first'
        ))}
    </div>
  );
}
export default Comment;
