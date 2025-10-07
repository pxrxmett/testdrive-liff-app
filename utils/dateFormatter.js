import dayjs from 'dayjs'
import 'dayjs/locale/th' // เพิ่มภาษาไทย
import customParseFormat from 'dayjs/plugin/customParseFormat'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// เพิ่มปลั๊กอินสำหรับการแปลงรูปแบบวันที่ที่กำหนดเอง
dayjs.extend(customParseFormat)
dayjs.extend(utc)
dayjs.extend(timezone)

// ตั้งค่าให้ใช้ภาษาไทย
dayjs.locale('th')

// ตาราง mapping เดือนไทยแบบย่อเป็นเลข
const thaiMonthMap = {
  'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03', 'เม.ย.': '04',
  'พ.ค.': '05', 'มิ.ย.': '06', 'ก.ค.': '07', 'ส.ค.': '08',
  'ก.ย.': '09', 'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12'
}

// กำหนดเวลาทำการ
const BUSINESS_HOURS = {
  start: '08:00',
  end: '18:00',
  timeZone: 'Asia/Bangkok',
  // กำหนดวันทำการ (0 = อาทิตย์, 1 = จันทร์, ..., 6 = เสาร์)
  workingDays: [1, 2, 3, 4, 5, 6], // จันทร์-เสาร์
  // ช่วงเวลาพัก (ถ้ามี)
  breakTime: {
    start: '12:00',
    end: '13:00'
  }
}

/**
 * ฟังก์ชันตรวจสอบว่าปีเป็น พ.ศ. หรือ ค.ศ.
 * โดยปกติปี พ.ศ. จะมีค่ามากกว่า 2500
 * @param {number} year ปีที่ต้องการตรวจสอบ
 * @returns {boolean} ผลการตรวจสอบ (true ถ้าเป็น พ.ศ., false ถ้าเป็น ค.ศ.)
 */
const isThaiYear = (year) => {
  return year > 2500;
}

/**
 * ฟังก์ชันสำหรับแปลงวันที่ในรูปแบบไทย เช่น "20 ก.พ. 2566" หรือ "20 ก.พ. 2025" เป็นรูปแบบที่ dayjs เข้าใจ
 * รองรับทั้งปี พ.ศ. และ ค.ศ.
 * @param {string} thaiDateStr วันที่ในรูปแบบไทย
 * @returns {string} วันที่ในรูปแบบ ISO หรือ null ถ้าไม่สามารถแปลงได้
 */
export const parseThaiDate = (thaiDateStr) => {
  if (!thaiDateStr || typeof thaiDateStr !== 'string') return null;
  
  try {
    // แยกส่วนของวันที่ด้วยช่องว่าง
    const parts = thaiDateStr.split(' ').filter(part => part.trim() !== '');
    
    if (parts.length >= 3) {
      const day = parts[0].padStart(2, '0');
      let monthAbbr = parts[1];
      
      // ทำความสะอาดเดือน (ตัดช่องว่างและจุด)
      if (monthAbbr.endsWith('.')) {
        monthAbbr = monthAbbr.trim();
      } else {
        // กรณีที่ไม่มีจุด ให้เพิ่มจุด
        monthAbbr = monthAbbr.trim() + '.';
      }
      
      const year = parseInt(parts[parts.length - 1]);
      
      // ตรวจสอบว่าเป็นปี พ.ศ. หรือ ค.ศ.
      const westernYear = isThaiYear(year) ? year - 543 : year;
      
      // แปลงเดือนเป็นตัวเลข
      const monthNumber = thaiMonthMap[monthAbbr];
      
      if (monthNumber) {
        return `${westernYear}-${monthNumber}-${day}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing Thai date:', error);
    return null;
  }
}

/**
 * ฟังก์ชันจัดรูปแบบวันที่พื้นฐาน
 * @param {string|Date} date วันที่ที่ต้องการจัดรูปแบบ
 * @param {string} format รูปแบบที่ต้องการ (ค่าเริ่มต้น: DD/MM/YYYY)
 * @returns {string} วันที่ที่จัดรูปแบบแล้ว หรือ '-' ถ้าไม่มีข้อมูล
 */
export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return 'ไม่ระบุวันที่'
  
  try {
    // ถ้าเป็นวันที่ในรูปแบบไทย (เช่น "20 ก.พ. 2566") ให้แปลงเป็นรูปแบบที่ dayjs เข้าใจ
    let processedDate = date
    if (typeof date === 'string') {
      const parsedThaiDate = parseThaiDate(date)
      if (parsedThaiDate) {
        processedDate = parsedThaiDate
      }
    }
    
    // ตรวจสอบว่าวันที่ถูกต้องหรือไม่
    const d = dayjs(processedDate).tz(BUSINESS_HOURS.timeZone)
    if (!d.isValid()) {
      console.log('วันที่ไม่สามารถแปลงได้ (แสดงตามที่รับมา):', date)
      return date // ส่งคืนค่าเดิมแทนการแสดงข้อความ 'ไม่ระบุวันที่'
    }
    
    // แสดงแบบพิเศษสำหรับวันที่ใกล้เคียง
    const today = dayjs().tz(BUSINESS_HOURS.timeZone)
    const tomorrow = today.add(1, 'day')
    const yesterday = today.subtract(1, 'day')
    
    if (d.isSame(today, 'day')) {
      return 'วันนี้'
    } else if (d.isSame(tomorrow, 'day')) {
      return 'พรุ่งนี้'
    } else if (d.isSame(yesterday, 'day')) {
      return 'เมื่อวาน'
    }
    
    // แปลงเป็นวันที่ไทย (พ.ศ.)
    const thaiDate = d.locale('th')
    return thaiDate.format('D MMM YYYY')
  } catch (error) {
    console.error('Error formatting date:', error, date)
    return date // ส่งคืนค่าเดิมแทนการแสดงข้อความ 'ไม่ระบุวันที่'
  }
}

/**
 * ฟังก์ชันจัดรูปแบบวันที่และเวลา
 * @param {string|Date} date วันที่และเวลาที่ต้องการจัดรูปแบบ
 * @param {string} format รูปแบบที่ต้องการ (ค่าเริ่มต้น: DD/MM/YYYY HH:mm)
 * @returns {string} วันที่และเวลาที่จัดรูปแบบแล้ว หรือ '-' ถ้าไม่มีข้อมูล
 */
export const formatDateTime = (date, format = 'DD/MM/YYYY HH:mm') => {
  if (!date) return 'ไม่ระบุ'
  
  try {
    // ถ้าเป็นวันที่ในรูปแบบไทย (เช่น "20 ก.พ. 2566") ให้แปลงเป็นรูปแบบที่ dayjs เข้าใจ
    let processedDate = date
    if (typeof date === 'string') {
      const parsedThaiDate = parseThaiDate(date)
      if (parsedThaiDate) {
        processedDate = parsedThaiDate
      }
    }
    
    // ตรวจสอบว่าวันที่ถูกต้องหรือไม่
    const d = dayjs(processedDate).tz(BUSINESS_HOURS.timeZone)
    if (!d.isValid()) {
      console.log('วันที่และเวลาไม่สามารถแปลงได้:', date)
      return date
    }
    
    return d.format(format)
  } catch (error) {
    console.error('Error formatting date time:', error, date)
    return date
  }
}

/**
 * ฟังก์ชันจัดรูปแบบเวลา พร้อมตรวจสอบเวลาทำการ
 * @param {string|Date} time เวลาที่ต้องการจัดรูปแบบ
 * @param {string} format รูปแบบที่ต้องการ (ค่าเริ่มต้น: HH:mm)
 * @returns {string} เวลาที่จัดรูปแบบแล้ว หรือค่าเดิมถ้าไม่สามารถแปลงได้
 */
export const formatTime = (time, format = 'HH:mm') => {
  if (!time) return 'ไม่ระบุเวลา'
  
  try {
    let formattedTime = ''
    
    // กรณีที่เป็นเวลาในรูปแบบ ISO (มี T)
    if (typeof time === 'string' && time.includes('T')) {
      try {
        const d = dayjs(time).tz(BUSINESS_HOURS.timeZone)
        formattedTime = d.format(format)
      } catch (e) {
        formattedTime = time.split('T')[1].substring(0, 5)
      }
    }
    // กรณีที่เป็นเวลาในรูปแบบ HH:mm:ss
    else if (typeof time === 'string' && time.includes(':')) {
      formattedTime = time.substring(0, 5)
    }
    // กรณีอื่นๆ ลองใช้ dayjs
    else {
      const d = dayjs(time).tz(BUSINESS_HOURS.timeZone)
      if (d.isValid()) {
        formattedTime = d.format(format)
      } else {
        formattedTime = time
      }
    }
    
    // ตรวจสอบเวลาทำการ
    if (formattedTime && formattedTime !== time) {
      const isBusinessTime = isWithinBusinessHours(formattedTime)
      if (!isBusinessTime) {
        formattedTime += ' ⚠️' // เพิ่มสัญลักษณ์เตือน
      }
    }
    
    return formattedTime
  } catch (error) {
    console.error('Error formatting time:', error, time)
    return time
  }
}

/**
 * ตรวจสอบว่าเวลาอยู่ในช่วงทำการหรือไม่
 * @param {string} timeString เวลาในรูปแบบ HH:mm
 * @returns {boolean} true ถ้าอยู่ในเวลาทำการ
 */
export const isWithinBusinessHours = (timeString) => {
  if (!timeString) return false
  
  try {
    // แปลงเวลาเป็น minutes จากเที่ยงคืน
    const timeMinutes = timeToMinutes(timeString)
    const startMinutes = timeToMinutes(BUSINESS_HOURS.start)
    const endMinutes = timeToMinutes(BUSINESS_HOURS.end)
    
    // ตรวจสอบช่วงเวลาทำการ
    const isWithinWorkHours = timeMinutes >= startMinutes && timeMinutes <= endMinutes
    
    // ตรวจสอบช่วงเวลาพัก (ถ้ามี)
    if (isWithinWorkHours && BUSINESS_HOURS.breakTime) {
      const breakStartMinutes = timeToMinutes(BUSINESS_HOURS.breakTime.start)
      const breakEndMinutes = timeToMinutes(BUSINESS_HOURS.breakTime.end)
      const isDuringBreak = timeMinutes >= breakStartMinutes && timeMinutes <= breakEndMinutes
      
      return !isDuringBreak // ไม่อยู่ในช่วงพัก
    }
    
    return isWithinWorkHours
  } catch (error) {
    console.error('Error checking business hours:', error)
    return false
  }
}

/**
 * ตรวจสอบว่าเป็นวันทำการหรือไม่
 * @param {string|Date} date วันที่ที่ต้องการตรวจสอบ
 * @returns {boolean} true ถ้าเป็นวันทำการ
 */
export const isWorkingDay = (date) => {
  if (!date) return false
  
  try {
    const d = dayjs(date).tz(BUSINESS_HOURS.timeZone)
    if (!d.isValid()) return false
    
    const dayOfWeek = d.day() // 0 = อาทิตย์, 1 = จันทร์, ...
    return BUSINESS_HOURS.workingDays.includes(dayOfWeek)
  } catch (error) {
    console.error('Error checking working day:', error)
    return false
  }
}

/**
 * แปลง HH:mm เป็น minutes จากเที่ยงคืน
 * @param {string} timeString เวลาในรูปแบบ HH:mm
 * @returns {number} จำนวนนาทีจากเที่ยงคืน
 */
const timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * ตรวจสอบว่าเวลาและวันที่เหมาะสมสำหรับการจองหรือไม่
 * @param {string|Date} datetime วันที่และเวลา
 * @returns {object} ผลการตรวจสอบ
 */
export const validateTimeSlot = (datetime) => {
  if (!datetime) {
    return {
      isValid: false,
      message: 'กรุณาระบุวันที่และเวลา'
    }
  }
  
  try {
    const d = dayjs(datetime).tz(BUSINESS_HOURS.timeZone)
    
    if (!d.isValid()) {
      return {
        isValid: false,
        message: 'รูปแบบวันที่หรือเวลาไม่ถูกต้อง'
      }
    }
    
    // ตรวจสอบว่าเป็นเวลาในอดีตหรือไม่
    const now = dayjs().tz(BUSINESS_HOURS.timeZone)
    if (d.isBefore(now)) {
      return {
        isValid: false,
        message: 'ไม่สามารถจองเวลาที่ผ่านมาแล้วได้'
      }
    }
    
    // ตรวจสอบวันทำการ
    if (!isWorkingDay(d)) {
      return {
        isValid: false,
        message: 'วันที่เลือกไม่ใช่วันทำการ'
      }
    }
    
    // ตรวจสอบเวลาทำการ
    const timeOnly = d.format('HH:mm')
    if (!isWithinBusinessHours(timeOnly)) {
      let message = `เวลาทำการ: ${BUSINESS_HOURS.start} - ${BUSINESS_HOURS.end} น.`
      
      if (BUSINESS_HOURS.breakTime) {
        message += ` (พักเที่ยง: ${BUSINESS_HOURS.breakTime.start} - ${BUSINESS_HOURS.breakTime.end} น.)`
      }
      
      return {
        isValid: false,
        message
      }
    }
    
    return {
      isValid: true,
      message: 'เวลาที่เลือกเหมาะสม'
    }
  } catch (error) {
    console.error('Error validating time slot:', error)
    return {
      isValid: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบเวลา'
    }
  }
}

/**
 * สร้างรายการช่วงเวลาที่สามารถจองได้
 * @param {string|Date} date วันที่
 * @param {number} duration ระยะเวลา (นาที)
 * @param {number} interval ช่วงเวลาระหว่างสล็อต (นาที)
 * @returns {Array} รายการช่วงเวลาที่ว่าง
 */
export const generateTimeSlots = (date, duration = 60, interval = 30) => {
  const slots = []
  
  try {
    const selectedDate = dayjs(date).tz(BUSINESS_HOURS.timeZone)
    const now = dayjs().tz(BUSINESS_HOURS.timeZone)
    
    if (!selectedDate.isValid() || !isWorkingDay(selectedDate)) {
      return slots
    }
    
    // สร้างช่วงเวลาตามช่วงที่กำหนด
    const startHour = parseInt(BUSINESS_HOURS.start.split(':')[0])
    const startMinute = parseInt(BUSINESS_HOURS.start.split(':')[1])
    const endHour = parseInt(BUSINESS_HOURS.end.split(':')[0])
    const endMinute = parseInt(BUSINESS_HOURS.end.split(':')[1])
    
    let currentTime = selectedDate.hour(startHour).minute(startMinute).second(0)
    const endTime = selectedDate.hour(endHour).minute(endMinute).second(0)
    
    while (currentTime.isBefore(endTime)) {
      // ข้ามช่วงเวลาที่ผ่านไปแล้ว (ถ้าเป็นวันเดียวกัน)
      if (selectedDate.isSame(now, 'day') && currentTime.isBefore(now.add(30, 'minute'))) {
        currentTime = currentTime.add(interval, 'minute')
        continue
      }
      
      // ตรวจสอบว่าสามารถจบการทดลองขับภายในเวลาทำการได้
      const slotEndTime = currentTime.add(duration, 'minute')
      const timeOnly = currentTime.format('HH:mm')
      const endTimeOnly = slotEndTime.format('HH:mm')
      
      // ข้ามช่วงเวลาพัก
      let skipBreakTime = false
      if (BUSINESS_HOURS.breakTime) {
        const breakStart = timeToMinutes(BUSINESS_HOURS.breakTime.start)
        const breakEnd = timeToMinutes(BUSINESS_HOURS.breakTime.end)
        const slotStart = timeToMinutes(timeOnly)
        const slotEnd = timeToMinutes(endTimeOnly)
        
        // ถ้าช่วงเวลานี้ทับกับช่วงพัก
        if ((slotStart < breakEnd && slotEnd > breakStart)) {
          skipBreakTime = true
        }
      }
      
      if (isWithinBusinessHours(timeOnly) && 
          isWithinBusinessHours(endTimeOnly) && 
          !skipBreakTime &&
          slotEndTime.isBefore(endTime.add(1, 'minute'))) {
        
        slots.push({
          time: timeOnly,
          display: `${timeOnly} น.`,
          datetime: currentTime.toISOString(),
          endTime: endTimeOnly,
          isAvailable: true, // ต้องตรวจสอบกับข้อมูลจริงว่าช่วงนี้ว่างหรือไม่
          duration: duration
        })
      }
      
      currentTime = currentTime.add(interval, 'minute')
    }
  } catch (error) {
    console.error('Error generating time slots:', error)
  }
  
  return slots
}

/**
 * ดึงข้อมูลเวลาทำการ
 * @returns {object} ข้อมูลเวลาทำการ
 */
export const getBusinessHours = () => {
  return { ...BUSINESS_HOURS }
}

/**
 * ฟังก์ชันเปรียบเทียบว่าวันที่อยู่ในอดีตหรือไม่
 * @param {string|Date} date วันที่ที่ต้องการตรวจสอบ
 * @returns {boolean} true ถ้าเป็นวันที่ในอดีต, false ถ้าเป็นวันที่ในอนาคตหรือวันนี้
 */
export const isPastDate = (date) => {
  if (!date) return false
  
  try {
    // ถ้าเป็นวันที่ในรูปแบบไทย (เช่น "20 ก.พ. 2566") ให้แปลงเป็นรูปแบบที่ dayjs เข้าใจ
    let processedDate = date
    if (typeof date === 'string') {
      const parsedThaiDate = parseThaiDate(date)
      if (parsedThaiDate) {
        processedDate = parsedThaiDate
      }
    }
    
    const d = dayjs(processedDate).tz(BUSINESS_HOURS.timeZone)
    if (!d.isValid()) {
      console.log('วันที่ไม่สามารถตรวจสอบได้ว่าเป็นอดีตหรือไม่:', date)
      return false
    }
    
    return d.isBefore(dayjs().tz(BUSINESS_HOURS.timeZone), 'day')
  } catch (error) {
    console.error('Error checking past date:', error)
    return false
  }
}

/**
 * แสดงวันที่ในรูปแบบไทย เช่น "1 มกราคม 2566"
 * @param {string|Date} date วันที่ที่ต้องการจัดรูปแบบ
 * @returns {string} วันที่ในรูปแบบไทย หรือค่าเดิมถ้าไม่สามารถแปลงได้
 */
export const formatThaiDate = (date) => {
  if (!date) return 'ไม่ระบุวันที่'
  
  try {
    // ถ้าเป็นวันที่ในรูปแบบไทยอยู่แล้ว (เช่น "20 ก.พ. 2566") ให้ส่งค่าเดิมกลับไป
    if (typeof date === 'string' && parseThaiDate(date)) {
      return date
    }
    
    // ตรวจสอบว่าวันที่ถูกต้องหรือไม่
    const d = dayjs(date).tz(BUSINESS_HOURS.timeZone)
    if (!d.isValid()) {
      console.log('วันที่ไม่สามารถแปลงเป็นรูปแบบไทยได้:', date)
      return date
    }
    
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]
    
    const day = d.date()
    const month = thaiMonths[d.month()]
    const year = d.year() + 543 // แปลงเป็นปี พ.ศ.
    
    return `${day} ${month} ${year}`
  } catch (error) {
    console.error('Error formatting Thai date:', error)
    return date
  }
}

export default {
  formatDate,
  formatDateTime,
  formatTime,
  isPastDate,
  formatThaiDate,
  parseThaiDate,
  isWithinBusinessHours,
  isWorkingDay,
  validateTimeSlot,
  generateTimeSlots,
  getBusinessHours
}