import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";

export async function getAllHabits() {
  try {
    // get today's date in YYYYMMDD format
    const today = new Date();
    const todayYYYYMMDD = today
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");

    // get two month before today's date in YYYYMMDD format
    const twoMonthBefore = new Date();
    twoMonthBefore.setMonth(twoMonthBefore.getMonth() - 2);
    const twoMonthBeforeYYYYMMDD = twoMonthBefore
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");
    const allHabits = await logseq.DB.datascriptQuery(`
    [
        :find (pull ?b [*]) ?name
              :where
              [?b :block/page ?page]
              [?page :block/journal? true]
              [?page :block/journal-day ?d]
              [(>= ?d ${twoMonthBeforeYYYYMMDD})]
              [(<= ?d ${todayYYYYMMDD})]
              [?b :block/refs ?refpage]
              [?refpage :block/properties ?pp]
              [(get ?pp :tags) ?tags]
              (or 
                [(get ?tags "habit") ]
                [(get ?tags "ongoing🟩") ]
              )
              [?refpage :block/name ?name]
  ]
      `);

    console.log(allHabits);

    if (allHabits) {
      let payload = allHabits.map((a: [BlockEntity, string]) => ({
        content: a[1],//.content,//.substring(5),
        parentId: a[0].page.id,
        uuid: a[0].uuid,
      }));

      for (let i = 0; i < payload.length; i++) {
        const pageDetails = await logseq.Editor.getPage(payload[i].parentId);
        const dateName = pageDetails!.originalName;
        const rawDate = pageDetails!.journalDay;

        payload[i]["dateName"] = dateName;
        payload[i]["rawDate"] = rawDate;
      }

      payload = payload
        // Filters out TODOs on non journal pages
        .filter((a: any) => a.rawDate !== undefined)
        // Sorts by date
        .sort(
          (a: BlockEntity, b: BlockEntity) =>
            parseInt(a.rawDate) - parseInt(b.rawDate)
        )
        // Take only first few items depending on settings
        .slice(-logseq.settings!.noOfItems);

      return payload;
    }
  } catch (e) {
    console.log(e);
  }
}
