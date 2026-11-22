import { test, expect } from '@playwright/test'

test.describe('SABKAAM desktop and mobile smoke tests', () => {
  test('home screen fits a mobile viewport without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /काम की तलाश अब/ })).toBeVisible()
    const width = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(width).toBeLessThanOrEqual(390)
  })

  test('language selector translates home, candidate, employer, and safety screens', async ({ page }) => {
    await page.goto('/')
    const language = page.getByLabel('Website language')
    await language.selectOption('en')
    await expect(page.getByRole('heading', { name: /Finding work is now/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Search jobs/ })).toBeVisible()
    await page.getByRole('button', { name: /Hiring/ }).click()
    await expect(page.getByRole('heading', { name: /Find the right people/ })).toBeVisible()
    await page.getByLabel('Website language').selectOption('hinglish')
    await expect(page.getByRole('heading', { name: /Sahi log dhoondhein/ })).toBeVisible()
    await page.getByLabel('Website language').selectOption('en')
    await page.getByRole('button', { name: /Back to home/ }).click()
    await page.getByRole('button', { name: 'Profile' }).click()
    await expect(page.getByRole('heading', { name: 'My profile' })).toBeVisible()
    await page.getByRole('button', { name: /Safety & reports/ }).click()
    await expect(page.getByRole('heading', { name: 'Find work safely' })).toBeVisible()
  })

  test('desktop home can filter sample jobs by state and district', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.getByRole('button', { name: /सभी श्रेणियाँ/ }).click()
    await expect(page.getByText('दुकान में सेल्स हेल्पर')).toBeVisible()
    await page.getByLabel('राज्य').selectOption('Jharkhand')
    await page.getByRole('button', { name: /काम खोजें/ }).click()
    await expect(page.getByText(/इस फ़िल्टर के लिए अभी कोई डेमो उदाहरण नहीं है/)).toBeVisible()
  })

  test('employer form exposes India-wide state and district options and validates required fields', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.getByRole('button', { name: /नौकरी देने वाले/ }).click()
    const district = page.getByLabel('जिला')
    await expect(district.locator('option')).toHaveCount(38)
    await page.getByLabel('राज्य').selectOption('Jharkhand')
    await expect(district.locator('option')).toHaveCount(24)
    await page.getByLabel('दुकान / कंपनी का नाम').fill('टेस्ट स्टोर')
    await page.getByLabel('संपर्क व्यक्ति का नाम').fill('टेस्ट यूजर')
    await page.getByLabel('मोबाइल नंबर').fill('9876543210')
    await page.getByLabel('काम / पद का नाम').fill('सेल्स हेल्पर')
    await page.getByRole('button', { name: /डेमो पोस्ट का प्रीव्यू देखें/ }).click()
    await expect(page.getByText(/प्रीव्यू तैयार है/)).toBeVisible()
    const width = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(width).toBeLessThanOrEqual(390)
  })

  test('all 36 States/UTs are available and Karnataka includes Bengaluru Urban', async ({ page }) => {
    await page.goto('/')
    const state = page.getByLabel('राज्य')
    await expect(state.locator('option')).toHaveCount(36)
    await state.selectOption('Karnataka')
    await page.getByRole('button', { name: /काम खोजें/ }).click()
    await expect(page.getByLabel('जिला').locator('option', { hasText: 'Bengaluru Urban' })).toHaveCount(1)
  })

  test('all State/UT district dropdowns sum to the imported LGD snapshot', async ({ page }) => {
    await page.goto('/')
    const state = page.getByLabel('राज्य')
    const district = page.getByLabel('जिला')
    const values = await state.locator('option').evaluateAll(options => options.map(option => (option as HTMLOptionElement).value))
    expect(values).toHaveLength(36)
    let totalDistricts = 0
    for (const value of values) {
      await state.selectOption(value)
      totalDistricts += (await district.locator('option').count()) - 1
    }
    expect(totalDistricts).toBe(785)
  })

  test('candidate profile form validates and updates its preview', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'प्रोफ़ाइल' }).click()
    await page.getByLabel('आपका नाम').fill('सीमा देवी')
    await page.getByLabel('मोबाइल नंबर').fill('9876543210')
    await page.getByLabel('आपको कौन-सा काम आता है?').fill('सिलाई')
    await page.getByRole('button', { name: /प्रोफ़ाइल सेव करें/ }).click()
    await expect(page.getByText('सीमा देवी')).toBeVisible()
    await expect(page.getByText(/डेमो प्रोफ़ाइल/)).toBeVisible()
  })

  test('job detail and application demo form work', async ({ page }) => {
    test.setTimeout(60000)
    await page.goto('/')
    await page.getByRole('button', { name: /सभी श्रेणियाँ/ }).click()
    await page.getByText('दुकान में सेल्स हेल्पर').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByLabel('आपका नाम').fill('राम कुमार')
    await page.getByLabel('मोबाइल नंबर').fill('9876543210')
    await page.getByRole('button', { name: /डेमो आवेदन देखें/ }).click()
    await expect(page.getByText(/डेमो आवेदन तैयार हुआ/)).toBeVisible()
  })


  test('premium category cards open a detail popup and AI applicant tab is available', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /दुकान और रिटेल/ }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'दुकान और रिटेल' })).toBeVisible()
    await page.getByRole('button', { name: /इस क्षेत्र के काम देखें/ }).click()
    await page.getByRole('button', { name: 'AI आवेदक' }).click()
    await expect(page.getByRole('heading', { name: /आपके लिए सही काम/ })).toBeVisible()
  })


  test('city and locality search suggests Delhi areas and accepts custom typed locations', async ({ page }) => {
    await page.goto('/')
    const area = page.getByLabel('शहर, इलाका या सेक्टर')
    await area.fill('मेट्रो उत्तम नगर')
    await expect(page.getByRole('option', { name: /Uttam Nagar/ }).first()).toBeVisible()
    await page.getByRole('option', { name: /Uttam Nagar/ }).first().click()
    await expect(page.getByLabel('राज्य')).toHaveValue('Delhi')
    await expect(area).toHaveValue('Uttam Nagar')
    await page.getByRole('button', { name: /काम खोजें/ }).click()
    await expect(page.getByRole('heading', { name: /उपलब्ध नौकरियाँ|काम के नमूने/ })).toBeVisible()

    await area.fill('मेरी नई गली 17')
    await page.getByRole('button', { name: 'इलाका खोजें' }).click()
    await expect(area).toHaveValue('मेरी नई गली 17')
  })

  test('safety report form supports demo fallback without backend credentials', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /सुरक्षा और शिकायत/ }).click()
    await page.getByLabel('क्या हुआ?').fill('यह ब्राउज़र परीक्षण की नमूना शिकायत है।')
    await page.getByRole('button', { name: /शिकायत भेजें/ }).click()
    await expect(page.getByText(/डेमो शिकायत तैयार हुई/)).toBeVisible()
  })
})
