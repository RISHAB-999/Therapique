import React, { useState, useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { assets } from '../../assets/assets'

const AddBook = () => {
  const { aToken } = useContext(AdminContext)
  const { backendUrl, currency } = useContext(AppContext)

  const [image1, setImage1] = useState(false)
  const [image2, setImage2] = useState(false)
  const [image3, setImage3] = useState(false)
  const [image4, setImage4] = useState(false)

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('Mental Health')
  const [sizes, setSizes] = useState(['Standard Paperback'])
  const [outOfStockSizes, setOutOfStockSizes] = useState([])
  const [inStock, setInStock] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleSizeToggle = (size) => {
    if (sizes.includes(size)) {
      if (sizes.length === 1) {
        toast.warning("At least one format/size must be selected")
        return
      }
      setSizes(sizes.filter(s => s !== size))
      setOutOfStockSizes(outOfStockSizes.filter(s => s !== size))
    } else {
      setSizes([...sizes, size])
    }
  }

  const toggleFormatStock = (format) => {
    if (outOfStockSizes.includes(format)) {
      setOutOfStockSizes(outOfStockSizes.filter(s => s !== format))
    } else {
      setOutOfStockSizes([...outOfStockSizes, format])
    }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    if (!image1 && !image2 && !image3 && !image4) {
      return toast.error('Please upload at least 1 book cover photo (Image 1)')
    }

    try {
      setLoading(true)
      const formData = new FormData()

      image1 && formData.append('image1', image1)
      image2 && formData.append('image2', image2)
      image3 && formData.append('image3', image3)
      image4 && formData.append('image4', image4)

      formData.append('title', title)
      formData.append('author', author)
      formData.append('description', description)
      formData.append('price', Number(price))
      formData.append('category', category)
      formData.append('sizes', JSON.stringify(sizes))
      formData.append('outOfStockSizes', JSON.stringify(outOfStockSizes))
      formData.append('inStock', inStock)

      const { data } = await axios.post(
        backendUrl + '/api/book/add',
        formData,
        { headers: { aToken } }
      )

      if (data.success) {
        toast.success(data.message)
        setImage1(false)
        setImage2(false)
        setImage3(false)
        setImage4(false)
        setTitle('')
        setAuthor('')
        setDescription('')
        setPrice('')
        setCategory('Mental Health')
        setSizes(['Standard Paperback'])
        setOutOfStockSizes([])
        setInStock(true)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='space-y-6 w-full max-w-[1000px] mx-auto'>
      <div className="border-b border-slate-200/80 pb-3">
        <h1 className='text-xl sm:text-2xl font-black text-gray-800 tracking-tight'>Add Book to Library</h1>
        <p className="text-xs text-gray-500 font-medium mt-0.5">Upload and list new therapy books, guides, and mental health literature with multiple gallery photos</p>
      </div>

      <form onSubmit={onSubmitHandler} className='bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6'>
        
        {/* Book Gallery Images Upload */}
        <div className='space-y-2.5'>
          <label className='text-xs font-extrabold uppercase tracking-wider text-purple-700 block'>
            Book Images (Upload Up To 4 Gallery Photos) *
          </label>
          <div className='flex flex-wrap gap-4'>
            {/* Image 1 */}
            <label htmlFor="image1" className='cursor-pointer group relative block'>
              <div className='w-28 h-36 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/50 flex flex-col items-center justify-center p-2 text-center overflow-hidden hover:border-purple-600 transition-all'>
                {image1 ? (
                  <img className='w-full h-full object-cover rounded-xl' src={URL.createObjectURL(image1)} alt="Preview 1" />
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flexCenter mb-1 font-bold text-sm">➕</div>
                    <span className="text-[11px] font-extrabold text-purple-700">Cover (Main)</span>
                    <span className="text-[9px] text-gray-400 mt-0.5">Image 1</span>
                  </>
                )}
              </div>
            </label>
            <input onChange={(e) => setImage1(e.target.files[0])} type="file" id="image1" accept="image/*" hidden />

            {/* Image 2 */}
            <label htmlFor="image2" className='cursor-pointer group relative block'>
              <div className='w-28 h-36 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-2 text-center overflow-hidden hover:border-purple-600 transition-all'>
                {image2 ? (
                  <img className='w-full h-full object-cover rounded-xl' src={URL.createObjectURL(image2)} alt="Preview 2" />
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-xl bg-slate-200 text-gray-600 flexCenter mb-1 font-bold text-sm">📷</div>
                    <span className="text-[11px] font-bold text-gray-700">Interior / Back</span>
                    <span className="text-[9px] text-gray-400 mt-0.5">Image 2</span>
                  </>
                )}
              </div>
            </label>
            <input onChange={(e) => setImage2(e.target.files[0])} type="file" id="image2" accept="image/*" hidden />

            {/* Image 3 */}
            <label htmlFor="image3" className='cursor-pointer group relative block'>
              <div className='w-28 h-36 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-2 text-center overflow-hidden hover:border-purple-600 transition-all'>
                {image3 ? (
                  <img className='w-full h-full object-cover rounded-xl' src={URL.createObjectURL(image3)} alt="Preview 3" />
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-xl bg-slate-200 text-gray-600 flexCenter mb-1 font-bold text-sm">📷</div>
                    <span className="text-[11px] font-bold text-gray-700">Extra Photo</span>
                    <span className="text-[9px] text-gray-400 mt-0.5">Image 3</span>
                  </>
                )}
              </div>
            </label>
            <input onChange={(e) => setImage3(e.target.files[0])} type="file" id="image3" accept="image/*" hidden />

            {/* Image 4 */}
            <label htmlFor="image4" className='cursor-pointer group relative block'>
              <div className='w-28 h-36 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-2 text-center overflow-hidden hover:border-purple-600 transition-all'>
                {image4 ? (
                  <img className='w-full h-full object-cover rounded-xl' src={URL.createObjectURL(image4)} alt="Preview 4" />
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-xl bg-slate-200 text-gray-600 flexCenter mb-1 font-bold text-sm">📷</div>
                    <span className="text-[11px] font-bold text-gray-700">Extra Photo</span>
                    <span className="text-[9px] text-gray-400 mt-0.5">Image 4</span>
                  </>
                )}
              </div>
            </label>
            <input onChange={(e) => setImage4(e.target.files[0])} type="file" id="image4" accept="image/*" hidden />
          </div>
          <p className='text-[11px] text-gray-500 font-medium'>
            💡 Upload up to 4 images for the book gallery (Main Cover, Back Cover, Open Pages, Spine).
          </p>
        </div>

        {/* Title & Author Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
          <div className='space-y-1.5'>
            <label className='text-xs font-bold text-gray-700 block'>Book Title *</label>
            <input
              type="text"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              required
              placeholder="e.g. Overcoming Anxiety & Stress"
              className='w-full text-xs font-medium text-gray-800 bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-purple-600'
            />
          </div>

          <div className='space-y-1.5'>
            <label className='text-xs font-bold text-gray-700 block'>Author Name *</label>
            <input
              type="text"
              onChange={(e) => setAuthor(e.target.value)}
              value={author}
              required
              placeholder="e.g. Dr. Arthur Aaron"
              className='w-full text-xs font-medium text-gray-800 bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-purple-600'
            />
          </div>
        </div>

        {/* Description */}
        <div className='space-y-1.5'>
          <label className='text-xs font-bold text-gray-700 block'>Book Summary & Description *</label>
          <textarea
            rows={4}
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            required
            placeholder="Write a clear overview of the book topics, key takeaways, and target readers..."
            className='w-full text-xs font-medium text-gray-800 bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:outline-none focus:border-purple-600 resize-none leading-relaxed'
          />
        </div>

        {/* Price & Category Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
          <div className='space-y-1.5'>
            <label className='text-xs font-bold text-gray-700 block'>Price ({currency}) *</label>
            <div className='flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200'>
              <span className='text-sm font-extrabold text-purple-700'>{currency}</span>
              <input
                type="number"
                onChange={(e) => setPrice(e.target.value)}
                value={price}
                required
                placeholder="499"
                className='w-full text-xs font-bold text-gray-800 bg-transparent focus:outline-none'
              />
            </div>
          </div>

          <div className='space-y-1.5'>
            <label className='text-xs font-bold text-gray-700 block'>Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className='w-full text-xs font-semibold text-gray-800 bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-purple-600 cursor-pointer'
            >
              <option value="Mental Health">Mental Health</option>
              <option value="Self-Help & Counseling">Self-Help & Counseling</option>
              <option value="Children & Parenting">Children & Parenting</option>
              <option value="Relationships & Family">Relationships & Family</option>
              <option value="Trauma Recovery">Trauma Recovery</option>
              <option value="Addiction Recovery">Addiction Recovery</option>
              <option value="CBT & Psychology">CBT & Psychology</option>
              <option value="Creative Therapy">Creative Therapy</option>
            </select>
          </div>
        </div>

        {/* Available Formats / Sizes */}
        <div className='space-y-2'>
          <label className='text-xs font-bold text-gray-700 block'>Available Formats / Sizes *</label>
          <div className='flex flex-wrap gap-2.5'>
            {['Standard Paperback', 'Deluxe Hardcover', 'Pocket / Travel Edition', 'E-Book', 'Audiobook'].map((format) => (
              <button
                type="button"
                key={format}
                onClick={() => handleSizeToggle(format)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                  sizes.includes(format)
                    ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                    : 'bg-slate-50 text-gray-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {sizes.includes(format) && '✓ '}
                {format}
              </button>
            ))}
          </div>
        </div>

        {/* Stock Checkbox */}
        <div className='flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80'>
          <input
            type="checkbox"
            id="in-stock"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
            className='w-4 h-4 accent-purple-600 rounded cursor-pointer'
          />
          <label htmlFor="in-stock" className='text-xs font-extrabold text-gray-800 cursor-pointer'>
            Currently In Stock & Ready for Ordering
          </label>
        </div>

        {/* Submit Button */}
        <div className='pt-2 flex justify-end'>
          <button
            type="submit"
            disabled={loading}
            className='px-8 py-3 rounded-xl bg-purple-600 text-white text-xs font-extrabold hover:bg-purple-700 shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50'
          >
            {loading ? 'Adding Book...' : 'Add Book to Library'}
          </button>
        </div>

      </form>
    </div>
  )
}

export default AddBook
